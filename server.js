const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    console.log("the db connection: ",con.connections);
    console.log('DB connection successful!');
}).catch( err => {
    console.log("An error occurred", err);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});
