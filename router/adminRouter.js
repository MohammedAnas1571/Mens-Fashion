const express = require("express")
const router = express.Router()
const { isAdmin, adminAuth } = require("../middleware/Auth")
const { loadAaminLogin,loadBanner,editBanner,loadEditBanner, banner,createBannner,bannerActivate,bannerDeactivate,calculateReport, loadEditCategory,catagoryDeactivate, editCategory, loadSales, addEditCoupon, loadCouponEdit, deleteCoupon, activeCoupon, loadCoupon, addCoupon, couponManagement, adminlogin, dashboard, UnblockTheUser, blockTheUser, addProductCategory, loadCategory, loadAddCategory, catagoryActivate, loadProductCreate, createProduct, loadProductPage, loadProductEditPage, editProduct, productActivate, productDeactivate, deleteImgDelete, orderManagment, updateStatus } = require("../controller/adminControler")
const { loadDash } = require("../controller/dashboardController")
const multer = require("multer")
const { imageCrop, multiCrop } = require("../middleware/crop")

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });










router.get("/adminsign", isAdmin, loadAaminLogin)
      .post("/adminsign", isAdmin, adminlogin)

router.get("/dashboard", adminAuth, loadDash)
router.get("/userlist", adminAuth, dashboard)
router.get("/userlist/Unblock-theUser", adminAuth, UnblockTheUser)
router.get("/userlist/block-theUser", adminAuth, blockTheUser)
router.get("/addcatagory", adminAuth, loadAddCategory)
      .post("/addcatagory", adminAuth, upload.single('image'), imageCrop, addProductCategory)

router.get("/Category-management", adminAuth, loadCategory)

router.get("/Catagory/:id/Edit", adminAuth, loadEditCategory)
      .post("/editCatagory", adminAuth, upload.single('image'), editCategory)


router.get("/Catagory/:id/Activate", adminAuth, catagoryActivate)
router.get("/Catagory/:id/Deactivate", adminAuth, catagoryDeactivate)



router.get("/addproduct", adminAuth, loadProductCreate)
      .post("/addproduct", adminAuth, upload.array("images", 3), multiCrop, createProduct)

router.get("/productlist", adminAuth, loadProductPage)
router.post("/productlist/Edit", adminAuth, upload.array("images", 3), multiCrop, editProduct)
router.get("/productlist/:id/Edit", adminAuth, loadProductEditPage)
router.get("/productlist/:imageId/:id/deleteImg", deleteImgDelete)
router.get("/productlist/:id/Active", adminAuth, productActivate)
router.get("/productlist/:id/Deactive", adminAuth, productDeactivate)
router.get("/orderManagment", adminAuth, orderManagment)
router.post("/managment/:id/:statusid", adminAuth, updateStatus)
router.get("/coupon", adminAuth, loadCoupon)
router.get("/addcoupon", adminAuth, addCoupon)
      .post("/addcoupon", adminAuth, couponManagement);
      
router.get("/coupon/:id/Delete", adminAuth, deleteCoupon)
router.get("/coupon/:id/Active", adminAuth, activeCoupon)
router.get("/coupon/:id/Edit-coupon", adminAuth, loadCouponEdit)
router.get("/coupon/edit", adminAuth, addEditCoupon)
router.get("/Report-managment", adminAuth, loadSales)
      .post('/Report-managment', adminAuth, calculateReport)
router.get("/banner",adminAuth,banner)
      .post("/banner",adminAuth, upload.single('image'),createBannner)
router.get("/bannerlist",adminAuth,loadBanner)
router.get("/bannerlist/:id/Active", adminAuth, bannerActivate)
router.get("/productlist/:id/Deactive", adminAuth, bannerDeactivate)
router.get("/editbanner/:id/Edit",adminAuth,loadEditBanner)
router.post("/editbanner", adminAuth, upload.single('image'), editBanner)





module.exports = router