// process the form
// store values in airtable
// display the brochure parade form using HTMLWriter values to replace USEREMAIL and USERID
export async function onRequestPost(context) {
    try {
      return await handleRequest(context);
    } catch (e) {
      console.error(e);
      return new Response("Error sending message", { status: 500 });
    }
  }
  class ElementHandler {
    constructor(options) {this.options = options;}
    element(element) {
      // An incoming element, such as `div`
      console.log(`Incoming element: ${element.tagName}`);
      // apend hidden form fields
      if(element.tagName === 'form'){      
        element.append(`<input type="hidden" name="email" value="${this.options.useremail}"><input type="hidden" name="userid" value="${this.options.userid}">`,{ html: true })
       }
    }
  
    comments(comment) {
      // An incoming comment
    }
  
    text(text) {
      // An incoming piece of text
    }
  }
  async function handleRequest({ request, env }) {
      
    async function readRequestBody(request) {
      const contentType = request.headers.get("content-type");
      if (contentType.includes("form")) {
        const formData = await request.formData();
        const body = {};
        for (const entry of formData.entries()) {
          body[entry[0]] = entry[1];
        }
        return body;
      } else {
        // Perhaps some other type of data was submitted in the form
        // like an image, or some other binary data.
        return "a file";
      }
    }

      async function formtoairtable(formReceived){
        var fetchurl = 'https://api.airtable.com/v0/appTDInc67J2LFy2g/tblE0z8AesoW6O0pw'
        var fetchmethod = 'GET'
        //// need to check the database for a record with the submitted email
        fetchurl = fetchurl + `?fields%5B%5D=brochure-requested&filterByFormula=(%7Bemail%7D%3D'${formReceived.email}')`
        const airtablecheck = await fetch(fetchurl, {
          method: fetchmethod,
          body: airtablejson,
          headers: {
          'Authorization': 'Bearer '+env.AT_TKN,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          }
        })
        const airtablecheckJSON = await airtablecheck.json()

        if(airtablecheckJSON.records.length > 0){
          console.log("We are PATCHING with this id: "+airtablecheckJSON.records[0].id)
          console.log("brochure-requested in the form: "+formReceived.brochure +" existing brochures "+airtablecheckJSON.records[0].fields["brochure-requested"])
         var thenewbrochurereqs = formReceived.brochure + ','+airtablecheckJSON.records[0].fields["brochure-requested"]
          fetchmethod = 'PATCH'
        var airtablejson = `{"records": [
          {
          "id": "${airtablecheckJSON.records[0].id}",
          "fields": {
            "brochure-requested": "${thenewbrochurereqs}"
          }
        }]}`
        // 
        // else we POST a whole new record
        }else{
        console.log("We are POSTING")
        fetchmethod ='POST'
        var airtablejson =`{
          "fields": {
            "Name": "${formReceived.name}",
            "email": "${formReceived.email}",
            "policy-agreed": true,
            "from-form": "${formReceived.page}",
            "brochure-requested": "${formReceived.brochure}"
           }
         }`
        }// end if a record exists
        console.log("the airtablejson: "+airtablejson)
        const airtableresponse = await fetch(fetchurl, {
           method: fetchmethod,
           body: airtablejson,
           headers: {
           'Authorization': 'Bearer '+env.AT_TKN,
           'Content-Type': 'application/json',
           'X-Requested-With': 'XMLHttpRequest',
           }
         })
         const airtableJSON = await airtableresponse.json()
         console.log("response after "+fetchmethod+": "+JSON.stringify(airtableJSON))
         if(fetchmethod == 'POST'){
          return airtableJSON.id
         }else{
          return airtableJSON.records[0].id //return from PATCH
         }
       };
    
  if (request.method === "POST") {
    //save the userdetails to Airtable
    //ready the email address and userid to pass to the HTMLRewriter options
    const reqBody = await readRequestBody(request);
    const leadid = await formtoairtable(reqBody);
    const requrl = new URL(request.url);
    const templateurl = requrl.protocol+'//'+requrl.host+'/brochure/index';
    const thankstemplate = await fetch(templateurl);
    
    const options = {"type":"brochureRequest","useremail":reqBody.email,"userid":leadid} // replace useremail and userid from form submission and airtable respectively
        return new HTMLRewriter()
        .on('form', new ElementHandler(options))
        .transform(thankstemplate);
    }
  }