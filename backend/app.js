const express = require('express');
const cors = require('cors');
const { dataSource } = require('./db/data-source');
const appError = require('./utils/appError');

const skillRouter = require('./router/skill');
const creditPackageRouter = require('./router/creditPackage');
const userRouter = require('./router/user')

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/coaches/skill', skillRouter)
app.use('/api/credit-package', creditPackageRouter)
app.use('/api/users', userRouter)


app.get("/healthcheck", async (req, res) => {
  try {
    await dataSource.query('SELECT 1'); // Simple query to check database connection
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Service Unavailable');
  }
});

// 404
app.use((req, res, next) => {
    // res.status(404).json({ status: 'failed', message: 'Not Found' });
    next(appError(404, 'Not found'))
    return
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
        status: statusCode === 500? 'error' : 'failed', 
        message: err.message || 'Internal Server Error' 
    });
}) 

dataSource.initialize().then(() => {
    app.listen(process.env.port, () => {
        console.log(`Server is running on port ${process.env.port}`);
    })
}).catch((error) => {
    console.error('Error during Data Source initialization:', error);
    process.exit(1); // Stop the application
});