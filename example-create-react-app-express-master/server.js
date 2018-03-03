const express = require('express');
var pg = require('pg-promise')();
const app = express();
const port = process.env.PORT || 5000;

const cn = {
    host: 'dinein.cii4achz1kn7.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'dinein',
    user: 'dinein',
    password: '20180229',
    idleTimeoutMillis: 15000
};

const db = pg(cn);

app.get('/api', (req, res) => {
  res.json({ express: ['Hello Waleed from Api not project, waleed,waleed2'] });
});

app.get('/businesses', (req, res)=>{
  db.any('SELECT * FROM businesses')
      .then(function(data) {
          // success;

          res.json({express: [data]});
          console.log(data)
      })

})

app.get('/tables/:qrcode?', (req, res)=>{
  let qrcode = (req.params.qrcode)
  console.log(qrcode)
  if (qrcode) {
      db.any('SELECT * FROM tables WHERE lower(qrcode) = $1 ' + [qrcode])
          //' UNION ' +
          //'SELECT * FROM tables WHERE lower(table_id) = $1 ', [qrcode])
          .then(function(data) {
              debug('this is tables',data);
              res.json(data);
      });
  } else {
      db.any('SELECT * FROM tables')
          .then(function(data) {
              debug('Tables data is :', data);
              res.json({express: [data]});
      });
  }

})


// list businesses
app.get('/businesses', (req, res)=>{
  db.any('SELECT * FROM businesses')
      .then(function(data) {
          // success;

          res.json({express: [data]});
          console.log(data)
      })

})

// get bills or get one single build
app.get('/bills/:billid?', (req, res)=>{
 var whereclause ='';
 var billid=req.params.billid;
 if (billid) {
   whereclause = `AND bill_id = ${billid}`
 }
 db.any('SELECT * FROM bills WHERE 1=1 '+ whereclause)
     .then(function(data) {
         // success;
         debug('this is bills:', data);
         res.json(data);
     })
     .catch(function(error) {
         // error;
         console.log('Error :', error)
     });
})

//Bills POST
//Receives table_id and location_id to create a new bill inside the DB.
app.post('/bills', (req, res)=>{
    var newBill = req.body;
    console.log(newBill);
    db.one('insert into bills (table_id, location_id) values ($1, $2) returning *', [newBill.table_id, newBill.location_id])
        .then(function(data) {
            // success;
            debug('this is bills:',data);
            res.status(201).send(data);
        })
        .catch(function(error) {
            // error;
            console.log('Error :', error)
        });

})


// get one or all locations
app.get('/locations/:locationid?', (req, res)=>{
 var whereclause ='';
 var locationid=req.params.locationid;
 if (locationid) {
   whereclause = ` AND location_id = '${locationid}'`
 }
 db.any('SELECT * FROM locations WHERE 1=1 ' + whereclause)
     .then(function(data) {
         // success;
         debug('this is locations:',data);
         res.status(200).send(data);
     })
     .catch(function(error) {
         // error;
         console.log('Error :', error)
     });
});

//GET orders
app.get('/orders', (req,res)=>{
  debug('req.query is : ', JSON.stringify(req.query, null, 4));
  var locationId = req.query.location_id;

  var tableIdFilter = '';
  var billIdFilter = '';

  if(req.query.table_id) var tableIdFilter = `AND table_id = '${req.query.table_id}'`
  if(req.query.bill_id) var billIdFilter = `AND bill_id = '${req.query.bill_id}'`;

  var queryStr = `
      SELECT
        b.location_id, b.table_id, b.bill_amount, b.bill_timestamp, oi.bill_id, oi.menu_item_id, mi.menu_id, mi.item_price, mi.item_description, mi.menu_item_pic, mi.menu_category
      FROM menu_items mi
      JOIN order_items oi using (menu_item_id)
      JOIN bills b using (bill_id)
        WHERE 1=1
          AND b.location_id = '${locationId}'
          ${tableIdFilter}
          ${billIdFilter}
      `;
   debug('Query String is : ', queryStr);

   db.any(queryStr)
       .then(function(data) {
           // success;
           debug('this is bills:', data);
           res.json(data);
       })
       .catch(function(error) {
           // error;
           console.log('Error :', error)
       });
});

//
// GET Menu Items by location, menu category and/or item_category
//
app.get('/items', (req, res)=>{
    // menu_category is optional query param
  //  debug('req.query is : ', JSON.stringify(req.query, null, 4));

    //var {location_id, business_id, menu_type, item_category} = req.query;

  //  var menuTypeFilter = itemCategoryFilter = businessFilter = locationFilter = '';

  //  if (!(location_id || business_id)) throw Error('Business Id or Location Id is required');

    //if(menu_type) menuTypeFilter = `AND menu_type = '${menu_type}'`;
    // here we are using json operators in postgres.  please see https://www.postgresql.org/docs/9.6/static/functions-json.html
    //if(item_category) itemCategoryFilter = `AND item_categories -> 'categories' ?& array['${item_category}']`;
    //if(business_id)   businessFilter     = `AND l.business_id = '${business_id}'`;
    //if(location_id)   locationFilter     = `AND l.location_id = '${location_id}'`;

    // here we put together the query that would be used to obtain menu
    // items from the db
    var queryStr = `
      SELECT
        m.menu_id, mi.menu_item_id, m.menu_type, m.menu_tags, mi.item_price,
        mi.item_description, mi.menu_item_pic, mi.item_categories
      FROM
           locations l
      JOIN menus m ON m.location_id = l.location_id
      JOIN menu_items mi ON m.menu_id = mi.menu_id
        WHERE 1=1

      `;
    // debug the query to see if it makes sense
    //debug('Query String is : ', queryStr);

    db.any(queryStr)
        .then(function(data) {
            // success;
          //  debug('this is bills:', data);
            res.json({express: [data]});
        })
        .catch(function(error) {
            // error;
            console.log('Error :', error);
            res.json({code: 404, message: "Invalid inputs sent"});
        });
});


//
// GET Menu Items by location, menu category and/or item_category
//
app.get('/menus', (req, res)=>{
    // menu_category is optional query param
    debug('req.query is : ', JSON.stringify(req.query, null, 4));

    var {location_id, business_id } = req.query;

    var businessFilter = locationFilter = '';

    if (!(location_id || business_id)) throw Error('Business Id or Location Id is required');

    if(business_id)   businessFilter = `AND l.business_id = '${business_id}'`;
    if(location_id)   locationFilter = `AND l.location_id = '${location_id}'`;

    // here we put together the query that would be used to obtain menu
    // items from the db
    var queryStr = `
      SELECT
        m.menu_id, m.location_id, m.business_id, m.menu_type, m.menu_tags
      FROM
           locations l
      JOIN menus m ON m.location_id = l.location_id
        WHERE 1=1
          ${businessFilter}
          ${locationFilter}
      `;
    // debug the query to see if it makes sense
    debug('Query String is : ', queryStr);

    db.any(queryStr)
        .then(function(data) {
            // success;
            debug('this is bills:', data);
            res.json(data);
        })
        .catch(function(error) {
            // error;
            console.log('Error :', error);
            res.json({code: 404, message: "Invalid inputs sent"})
        });
});






app.listen(port, () => console.log(`Listening on port ${port}`));
