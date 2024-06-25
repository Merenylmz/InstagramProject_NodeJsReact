module.exports = function(req, res, next){
    // res.locals.csrfToken = req.csrfToken();
    // console.log("Buraya geldi", res.locals.csrfToken);
    next();
};