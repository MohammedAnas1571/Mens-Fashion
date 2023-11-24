const isLogedout = (req, res, next) => {
    if (req.session.user) {
      
       next()
    } else {
        res.redirect("/login")
    }
}

const isLogged = (req, res, next) => {
    if (req.session.user) {
         res.redirect("/")
    } else {
          next()
    }
}

const adminAuth = (req,res,next) => {
    try {
        if(req.session.admin){
            
            next()
        }else{
            res.redirect("/admin/adminsign")
        }
    } catch (error) {
        console.log(error.message);
    }
}
const isAdmin = (req,res,next) => {
    try {
       if(!req.session.admin){
            next()
    
       }else{

        res.redirect('/admin/adminsign')
       }
    } catch (error) {
        console.log(error.message);
    }
}

const logouting = (req,res,next) => {
    req.session.destroy()
    res.redirect('/login')
}

module.exports = {isLogedout,isLogged,logouting,adminAuth,isAdmin}