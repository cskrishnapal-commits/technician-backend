const express = require("express");

const router = express.Router();

const {

    addServicePrice,

    getServicePrices,

    updateServicePrice,

    deleteServicePrice

} = require("../controllers/ServicePriceController");

router.post(
    "/",
    addServicePrice
);

router.get(
    "/:technicianId",
    getServicePrices
);

router.put(
    "/:id",
    updateServicePrice
);

router.delete(
    "/:id",
    deleteServicePrice
);

module.exports = router;