export interface AddClient {

    //Company Details
  legalName: string;
  industry: string;
  website: string;
  businessName: string;

  //contact Details
    email:string;
    phone:string;

    //address Details
    country:string;
    buildingName:string;
    streetNumber:number;
    streetName:string;
    unitNumber:number;
    city:string;
    state:string;
    zipCode:string;

    //lead details
    leadSource:string;
    clientType:string;
    lastContactedDate:string;

    //point of contact details
    firstName:string;
    lastName:string;
    gender:string;
    nationality:string;
    pointOfContactEmail:string;
    contactPhone:string;
    pointOfContactLinkedIn:string;


    //notes
    notes:string
}