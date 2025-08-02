const { StatusCodes } = require('http-status-codes');
const { LocationService } = require('../services');

const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { success } = require('../utils/common/error-response');

/**
 * POST : /locations
 * @param {*} req 
 * @param {*} res 
 */



async function createLocation(req, res) {

   const { body, file } = req;

 // console.log('Form fields:', body); // All text fields
 // console.log('Image file:', file);
    try {
        console.log(req.body);
       const filename = file.filename;
       const imageUrl = `/public/images/${filename}`;
        console.log(imageUrl);
        const location = await LocationService.createLocation({
            name: req.body.name,
            seatingCapacity: req.body.seatingCapacity,
            area: req.body.area,
            contactNumber: req.body.contactNumber,
            email: req.body.email,
            businessStartTime: req.body.businessStartTime,
            businessEndTime: req.body.businessEndTime,
            legalBusinessName: req.body.legalBusinessName,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
            image: ''
        }); 

        SuccessResponse.data = {location};

        return res.status(StatusCodes.CREATED)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }
}

async function updateLocation(req, res) {
  const { id } = req.params;
  const { body, file } = req;
   try {
    // Optional image handling
    // const filename = file?.filename;
    // const imageUrl = filename ? `/public/images/${filename}` : undefined;

    const updatedData = {
      name: body.name,
      seatingCapacity: body.seatingCapacity,
      area: body.area,
      contactNumber: body.contactNumber,
      email: body.email,
      businessStartTime: body.businessStartTime,
      businessEndTime: body.businessEndTime,
      legalBusinessName: body.legalBusinessName,
      address: body.address,
      city: body.city,
      status: body.status, // assuming 'status' replaces 'state'
      // image: imageUrl || '', // uncomment when file upload is needed
    };
    console.log("log in controller", updateLocation)
    const location = await LocationService.updateLocation(id, updatedData);
    SuccessResponse.data = location;
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}


async function getLocations(req, res) {
    try {
        console.log('This method is getting called.');
        const locations = await LocationService.getAllLocations();
        SuccessResponse.data = {locations: locations};
        SuccessResponse.message = 'Locations Fetched Successfully!'
        return res.status(StatusCodes.OK)
        .json(SuccessResponse)
    } catch(error) {
            console.log(error);
            ErrorResponse.error = error;
            return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}

async function getLocationById(req, res) {
    try {
        const {id} = req.params;

        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Location Id is required.'
            })
        }
        
        const location = await LocationService.getLocationById(id);
        console.log(`Loction in controller: ${location}`);
        SuccessResponse.data = {location: location};
        SuccessResponse.message = 'Location Fetched Successfully'
        return res.status(StatusCodes.OK)
        .json(SuccessResponse)
    } catch(error) {
            console.log(error);
            ErrorResponse.error = error;
            return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}

async function deleteLocation(req, res) {
    try {
        const {id} = req.params;

        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Location Id is required.'
            })
        }

        const response = await LocationService.deleteLocation(id);

        return res.status(StatusCodes.OK).json(response);
    } catch(error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json({
                success: false,
                message: error.message || 'Something went wrong while deleting Location.'
            });
    }

}


module.exports = {
    createLocation,
    getLocations,
    deleteLocation,
    getLocationById,
    updateLocation
} 