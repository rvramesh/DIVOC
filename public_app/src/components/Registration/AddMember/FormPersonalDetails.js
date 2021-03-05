import React, {useEffect, useState} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {CustomButton} from "../../CustomButton";
import state_and_districts from '../../../DummyData/state_and_districts.json';
import {maskPersonalDetails} from "../../../utils/maskPersonalDetails";
import axios from "axios";
import {CITIZEN_TOKEN_COOKIE_NAME, RECIPIENTS_API} from "../../../constants";
import {getUserNumberFromRecipientToken} from "../../../utils/reciepientAuth";
import {getCookie} from "../../../utils/cookies";
import {
    AADHAAR_ERROR_MESSAGE,
    DISTRICT_ERROR_MSG,
    EMAIL_ERROR_MESSAGE,
    GENDER_ERROR_MSG,
    INVALID_NAME_ERR_MSG,
    MAXIMUM_LENGTH_OF_NAME_ERROR_MSG,
    MINIMUM_LENGTH_OF_NAME_ERROR_MSG,
    NAME_ERROR_MSG,
    NATIONAL_ID_ERROR_MSG,
    NATIONAL_ID_TYPE_ERROR_MSG,
    PINCODE_ERROR_MESSAGE,
    STATE_ERROR_MSG
} from "./error-constants";
import {isInValidAadhaarNumber, isValidName, isValidPincode} from "../../../utils/validations";
import {constuctNationalId, getNationalIdNumber, getNationalIdType, ID_TYPES} from "../../../utils/national-id";

// TODO: get state and distict from flagr
const STATES = Object.values(state_and_districts['states']).map(obj => obj.name);

const GENDERS = [
    "Male",
    "Female",
    "Other"
];

const RESPONSIVE_COL_CLASS = "col-lg-7 col-md col-sm-10";
const RESPONSIVE_ROW_DIV_CLASS = "p-0 pt-2 col-lg-6 col-md-6 col-sm-12";

export const FormPersonalDetails = ({ setValue, formData, navigation, verifyDetails}) => {
    //"did:in.gov.uidai.aadhaar:11111111111", "did:in.gov.driverlicense:KA53/2323423"

    const { previous, next } = navigation;
    const [errors, setErrors] = useState({});

    function validateUserDetails() {
        const errors = {}
        const nationalIDType = getNationalIdType(formData.nationalId)
        const nationIDNumber = getNationalIdNumber(formData.nationalId)

        if(!nationalIDType) {
            errors.nationalIDType = NATIONAL_ID_TYPE_ERROR_MSG
        }
        if(!nationIDNumber) {
            errors.nationalID = NATIONAL_ID_ERROR_MSG;
        } else {
            console.log("IDDDD", nationalIDType, ID_TYPES[0])
            if(nationalIDType === ID_TYPES[0].value && isInValidAadhaarNumber(nationIDNumber)) {
                errors.aadhaar = AADHAAR_ERROR_MESSAGE
            }
        }
        if(!formData.name) {
            errors.name = NAME_ERROR_MSG
        } else if (formData.name.length < 2){
            errors.name = MINIMUM_LENGTH_OF_NAME_ERROR_MSG
        } else if (formData.name.length > 99) {
            errors.name = MAXIMUM_LENGTH_OF_NAME_ERROR_MSG
        } else {
            if(!isValidName(formData.name)) {
                errors.name = INVALID_NAME_ERR_MSG
            }
        }
        if(!formData.state) {
            errors.state = STATE_ERROR_MSG
        }
        if(!formData.district) {
            errors.district = DISTRICT_ERROR_MSG
        }

        if(formData.pincode && !isValidPincode(formData.pincode)) {
            errors.pincode = PINCODE_ERROR_MESSAGE
        }

        if(!formData.gender) {
            errors.gender = GENDER_ERROR_MSG
        }
        if (formData.email != "" && formData.email != formData.confirmEmail) {
            errors.email = EMAIL_ERROR_MESSAGE
        }

        setErrors(errors)
        return Object.values(errors).filter(e => e).length > 0
        // TODO: add validations before going to confirm screen
    }

    const onContinue = () => {
        if (validateUserDetails()) {
            alert("Please fill all the required field")
        } else {
            next()
        }
    };

    const onSubmit = () => {
        // TODO: refactor fields of formData itself to match api body
        let dataToSend = {...formData};
        delete dataToSend["state"];
        delete dataToSend["district"];
        delete dataToSend["contact"];
        delete dataToSend["pincode"];
        delete dataToSend["locality"];
        delete dataToSend["programId"]
        dataToSend["yob"] = parseInt(dataToSend["yob"]);
        dataToSend["address"] = {
            "addressLine1": "",
            "addressLine2": "",
            "state": "",
            "district": "",
            "pincode": ""
        };
        dataToSend["address"]["addressLine2"] = formData.locality;
        dataToSend["address"]["state"] = formData.state;
        dataToSend["address"]["district"] = formData.district;
        dataToSend["address"]["pincode"] = formData.pincode;
        dataToSend["phone"] = getUserNumberFromRecipientToken();
        dataToSend["beneficiaryPhone"] = formData.contact
        // While registering the user, By default user will be assigned to the selected program with dose 1
        dataToSend["appointments"] = [{
            "programId": formData.programId,
            "dose": "1"
        }]
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
        };
        axios.post(RECIPIENTS_API, dataToSend, config)
            .then(res => {
                if (res.status === 200) {
                    next()
                }
            })
            .catch(err => {
                alert("Error while registering, please try again later.\n" + err);
            });
    };
    return (
        <Container fluid>
            <div className="side-effect-container">
                <h3>{verifyDetails ? "Verify beneficiary details" : "Add details to register beneficiary"}</h3>
                <div className="shadow-sm bg-white form-container">
                    <IdDetails  verifyDetails={verifyDetails} formData={formData} setValue={setValue} errors={errors}/>
                    <BeneficiaryDetails verifyDetails={verifyDetails} formData={formData} setValue={setValue} errors={errors}/>
                    <ContactInfo verifyDetails={verifyDetails} formData={formData} setValue={setValue} errors={errors}/>
                </div>
                <div className="pt-3">
                    <CustomButton isLink={true} type="submit" onClick={previous}>
                        <span>Back</span>
                    </CustomButton>
                    { !verifyDetails &&
                    <CustomButton className="blue-btn" type="submit" onClick={onContinue}>
                        <span>Continue &#8594;</span>
                    </CustomButton>
                    }
                    { verifyDetails &&
                    <CustomButton className="blue-btn" type="submit" onClick={onSubmit}>
                        <span>Confirm</span>
                    </CustomButton>
                    }
                </div>
            </div>
        </Container>

    )
}

const ContactInfo = ({verifyDetails, formData, setValue, errors}) => {

    const userMobileNumber = getUserNumberFromRecipientToken();

    return (
        <div className="pt-5">
            <h5>Contact information for vaccination certificate</h5>
            <Row className="pt-2">
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"} htmlFor="mobile">Mobile</label>
                        { !verifyDetails && <div className="radio-group">

                            <div className="pb-2">

                                <label className="form-check-label" htmlFor="defaultContact">
                                    {userMobileNumber}
                                </label>
                            </div>
                        </div>
                        }
                        {
                            verifyDetails &&
                            <><br/><p>{formData.contact}</p></>
                        }
                    </Col>
                </div>
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"} hidden={verifyDetails && !formData.email} htmlFor="email">Beneficiary Email ID</label>
                        <div hidden={verifyDetails}>
                            <input className="form-control" id="email" name="email" type="text"
                                   placeholder="Enter Email ID"
                                   defaultValue={maskPersonalDetails(formData.email, true)}
                                   onBlur={(evt) => evt.target.value = maskPersonalDetails(evt.target.value, true)}
                                   onFocus={(evt) => evt.target.value = formData.email}
                                   onChange={(e) => setValue({target: {name:"email", value:e.target.value}})}/>
                            <div className="pt-2">
                                <label hidden={verifyDetails && !formData.email} htmlFor="confirmEmail">Verify Beneficiary Email ID</label>
                                <input className="form-control" id="confirmEmail" name="email" type="text"
                                       placeholder="Confirm Email ID"
                                       value={formData.confirmEmail}
                                       onChange={(e) => setValue({target: {name:"confirmEmail", value:e.target.value}})}
                                />
                            </div>
                            <div className="invalid-input">
                                {errors.email}
                            </div>
                        </div>
                        {
                            verifyDetails &&
                            <><br/><p>{maskPersonalDetails(formData.email)}</p></>
                        }
                    </Col>
                </div>
            </Row>
        </div>
    )
};

const IdDetails = ({verifyDetails, formData, setValue, errors}) => {

    function getSelectedIdType() {
        const preSelectedIdValue = formData.nationalId ? getNationalIdType(formData.nationalId): undefined;
        return preSelectedIdValue ? ID_TYPES.filter(a => a.value === preSelectedIdValue)[0].name: ""
    }

    function onIdChange(event, type) {
        if (type === "idType") {
            const idValue = event.target.value;
            let existingIdNumber = "";
            if (formData.nationalId) {
                const nationalIdNumber = getNationalIdNumber(formData.nationalId);
                existingIdNumber = nationalIdNumber ? nationalIdNumber: ""
            }
            let nationalId = constuctNationalId(idValue, existingIdNumber)
            setValue({target: {name:"nationalId", value:nationalId}})
        } else if (type === "idNumber") {
            const idNumber = event.target.value;
            let existingIdType = "";
            if (formData.nationalId) {
                const nationalIdType = getNationalIdType(formData.nationalId);
                existingIdType = nationalIdType ? nationalIdType: "";
            }
            let nationalId = constuctNationalId(existingIdType, idNumber);
            setValue({target: {name:"nationalId", value:nationalId}})
        }
    }

    return (
        <div>
            <h5>ID details</h5>
            <Row className="pt-2">
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"} htmlFor="idType">ID Type </label>
                        <select className="form-control" id="idType"
                                hidden={verifyDetails}
                                placeholder="Select ID Type"
                                onChange={(e) => onIdChange(e, "idType")}>
                            <option disabled selected={!getSelectedIdType()} value>Select ID Type</option>
                            {
                                ID_TYPES.map(d => <option selected={d.name === getSelectedIdType()} value={d.value}>{d.name}</option>)
                            }
                        </select>
                        <div className="invalid-input">
                            {errors.nationalIDType}
                        </div>
                        {
                            verifyDetails &&
                            <p>{getSelectedIdType()}</p>
                        }
                    </Col>
                </div>
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"} htmlFor="idNumber">ID Number </label>
                        <input className="form-control" id="idNumber"
                               hidden={verifyDetails}
                               type="text" placeholder="Enter ID Number"
                               defaultValue={getNationalIdNumber(formData.nationalId)}
                               onBlur={(e) => onIdChange(e, "idNumber")}/>
                        <div className="invalid-input">
                            {errors.nationalID}

                        </div>
                        <div className="invalid-input">
                            {errors.aadhaar}
                        </div>
                        {
                            verifyDetails &&
                            <p>{getNationalIdNumber(formData.nationalId)}</p>
                        }
                    </Col>
                </div>
            </Row>
            <Row className="pt-2">
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"} htmlFor="name">Name  (As per ID card)</label>
                        <input className="form-control" name="name" id="name" type="text"
                               hidden={verifyDetails}
                               placeholder="Enter Name"
                               defaultValue={formData.name}
                               onBlur={setValue}/>
                        <div className="invalid-input">
                            {errors.name}
                        </div>
                        {
                            verifyDetails &&
                            <p>{formData.name}</p>
                        }
                    </Col>
                </div>
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"} htmlFor="name">Age</label>
                        <div> {new Date().getFullYear() - formData.yob} Years </div>
                    </Col>
                </div>
            </Row>
            <Row className="pt-2">
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"} htmlFor="gender">Gender </label>
                        <select className="form-control" id="gender" name="gender" onChange={setValue} hidden={verifyDetails}>
                            <option disabled selected={!formData.gender} value>Select Gender</option>
                            {
                                GENDERS.map(id => <option selected={id === formData.gender} value={id}>{id}</option>)
                            }
                        </select>
                        {
                            verifyDetails &&
                            <><br/><p>{formData.gender}</p></>
                        }
                        <div className="invalid-input">
                            {errors.gender}
                        </div>
                    </Col>
                </div>
            </Row>
        </div>
    )
};

const BeneficiaryDetails = ({verifyDetails, formData, setValue, errors}) => {

    const [districts, setDistricts] = useState([]);

    useEffect(() => {
        setDistictsForState(formData.state)
    }, []);

    function onStateSelected(stateSelected) {
        setValue({target: {name:"state", value:stateSelected}});
        setValue({target: {name:"district", value:""}});
        setDistictsForState(stateSelected)
    }

    function setDistictsForState(state) {
        const stateObj = Object.values(state_and_districts['states']).find(obj => obj.name === state);
        if (stateObj) {
            setDistricts(stateObj.districts)
        } else {
            setDistricts([])
        }
    }

    function setDobValue(dob) {
        setValue({target: {name:"dob", value:dob}})
    }
    // const minDate = new Date();
    // minDate.setYear(minDate.getYear() - maxAge);
    return (
        <div className="pt-5">
            <h5>Residence Details</h5>
            <Row className="pt-2">
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"} htmlFor="state">State </label>
                        <select className="form-control" name="state" id="state"
                                onChange={(e) => onStateSelected(e.target.value)}
                                hidden={verifyDetails}>
                            <option disabled selected={!formData.state} value>Select State</option>
                            {
                                STATES.map(id => <option selected={id === formData.state} value={id}>{id}</option>)
                            }
                        </select>
                        <div className="invalid-input">
                            {errors.state}
                        </div>
                        {
                            verifyDetails &&
                            <p>{formData.state}</p>
                        }
                    </Col>
                </div>
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label className={verifyDetails ? "custom-verify-text-label" : "custom-text-label required"} htmlFor="district">District </label>
                        <select className="form-control" id="district" name="district" onChange={setValue} hidden={verifyDetails}>
                            <option disabled selected={!formData.district} value>Select District</option>
                            {
                                districts.map(d => <option selected={d.name === formData.district} value={d.name}>{d.name}</option>)
                            }
                        </select>
                        <div className="invalid-input">
                            {errors.district}
                        </div>
                        {
                            verifyDetails &&
                            <p>{formData.district}</p>
                        }
                    </Col>
                </div>
            </Row>
            <Row className="pt-2">
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label hidden={verifyDetails && !formData.locality}
                               className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                               htmlFor="locality">Locality</label>
                        <input className="form-control" name="locality" id="locality" type="text"
                               hidden={verifyDetails}
                               placeholder="Enter your locality"
                               defaultValue={formData.locality}
                               onBlur={setValue}/>
                        {
                            verifyDetails &&
                            <p>{formData.locality}</p>
                        }
                    </Col>
                </div>
                <div className={RESPONSIVE_ROW_DIV_CLASS}>
                    <Col className={RESPONSIVE_COL_CLASS}>
                        <label hidden={verifyDetails && !formData.pincode}
                               className={verifyDetails ? "custom-verify-text-label" : "custom-text-label"}
                               htmlFor="pinCode">Pin code</label>
                        <input className="form-control" name="pincode" id="pinCode" type="text"
                               hidden={verifyDetails}
                               placeholder="Enter your pin code"
                               defaultValue={formData.pincode}
                               onBlur={setValue}
                        />
                        <div className="invalid-input">
                            {errors.pincode}
                        </div>
                        {
                            verifyDetails &&
                            <p>{formData.pincode}</p>
                        }
                    </Col>
                </div>
            </Row>
        </div>
    )
};
