const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

console.log("the process environment", process.env);

const DB = process.env.DATABASE_LOCAL

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    // console.log("the db connection: ",con.connections);
    console.log('DB connection successful!');
}).catch( err => {
    console.log("An error occurred", err);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});
