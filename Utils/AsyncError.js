const AsyncError = (fun) => {
    return (req,res,next)=>{
       fun(req,res,next).catch((err)=> next(err) )
    }
};
module.exports = AsyncError;
