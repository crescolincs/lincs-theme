// Only allow the form to be submitted if at least 1 of the brochures is selected
// get post request check for brochures
/*
    update the airtable records with requested brochures
   send an email with links to each download selected
   
   display a thankyou message with reminder to check email
*/

export async function onRequestPost(context) {
    try {
      return await handleRequest(context);
    } catch (e) {
      console.error(e);
      return new Response("Error sending message", { status: 500 });
    }
  }
  
  async function handleRequest({ request, env }) {
      /**
       * rawHtmlResponse returns HTML inputted directly
       * into the worker script
       * @param {string} html
       */
      function rawHtmlResponse(html) {
        return new Response(html, {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
        });
      }
      class ElementHandler {
        constructor(options) {this.options = options;}
        element(element) {
          // An incoming element, such as `div`
          console.log(`Incoming element: ${element.tagName}`);
          // apend hidden form fields
                
            element.setInnerContent(`email address ${this.options.useremail}`,{ html: true })
           
    
        }
      
        comments(comment) {
          // An incoming comment
        }
      
        text(text) {
          // An incoming piece of text
        }
      }
      async function formtoairtable(formReceived){
        var fetchurl = 'https://api.airtable.com/v0/appTDInc67J2LFy2g/tblE0z8AesoW6O0pw'
        var fetchmethod = 'GET'
        //// need to check the database for a record with the submitted email
        var encodedemailaddress = formReceived.email.replaceAll('+','%2B')
        fetchurl = fetchurl + `?fields%5B%5D=brochure-requested&filterByFormula=(%7Bemail%7D%3D'${encodedemailaddress}')`
        console.log('the fetchurl '+fetchurl)
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
          // Send email to team
          async function sendemailtobackoffice(formreceived) {
            var bodyofemail = '';
            var brochurelist = ''
            for (const field in formreceived) {
              if(field == 'brochure'){
                for (const brochure of formreceived.brochure) {
                  brochurelist = brochurelist + `${brochure}\n`;
                }
                bodyofemail = bodyofemail + `${field}: ${brochurelist}\n`;
              }else{
                bodyofemail = bodyofemail + `${field}: ${formreceived[field]}\n`;
             }
            }
            const emailparts= 
            {
              "from": {"email": "team@investlincolnshire.co.uk", "name": "Team Invest Lincs"},
              "to": [{"email": "crescolincs@gmail.com", "name": "Cresco Lincs"}],
              "subject": "Invest Lincolnshire Enquiry from All Brochures page",
              "text": bodyofemail,//"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender,
              "html": bodyofemail.replaceAll('\n','<br>') //"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender
            }
            const result = await fetch(`https://api.mailersend.com/v1/email`, {
                method: 'POST',
                body: JSON.stringify(emailparts),
                headers: {
                  'Authorization': 'Bearer '+env.MS_TKN,
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                  
                }
              })
          };
             // Send email to Requestor
             async function sendemailtorequester( toemail, toname, brochures, atid) {
               //loop brochures
               var brochurelinks = ''
              for (const brochure of brochures) {
                    brochurelinks = brochurelinks + `${brochure} https://brochures.investlincolnshire.co.uk/sendbrochures/${atid}/${brochure}\n\n`;
              }
              var bodyofemail = 'You can download the documents you requested from the following links:\n\n'+brochurelinks;
              const emailparts = 
              {
                "from": {"email": "team@investlincolnshire.co.uk", "name": "Team Invest Lincs"},
                "to": [{"email": toemail, "name": toname}],
                "subject": "Information from Invest Lincolnshire",
                "text": bodyofemail,//"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender,
                "html": bodyofemail.replaceAll('\n','<br>') //"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender
              }
              const result = await fetch(`https://api.mailersend.com/v1/email`, {
                  method: 'POST',
                  body: JSON.stringify(emailparts),
                  headers: {
                    'Authorization': 'Bearer '+env.MS_TKN,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    
                  }
                })
            };  
      /**
       * readRequestBody reads in the incoming request body
       * Use await readRequestBody(..) in an async function to get the string
       * @param {Request} request the incoming request to read from
       */
      async function readRequestBody(request) {
        const contentType = request.headers.get("content-type");
        if (contentType.includes("application/json")) {
          const strreceivedJSON = JSON.stringify(await request.json())
          console.log("Receiver strreceivedJSON "+strreceivedJSON)
          return strreceivedJSON;
        } else if (contentType.includes("application/text")) {
          return request.text();
        } else if (contentType.includes("text/html")) {
          return request.text();
        } else if (contentType.includes("form")) {
          const formData = await request.formData();
          const body = {};
          for (const entry of formData.entries()) {
            if(entry[0] == 'brochure'){
              body[entry[0]] = formData.getAll(entry[0]);
              }else{
                body[entry[0]] = entry[1]
              }
          }
          //return JSON.stringify(body)
          return body;
        } else {
          // Perhaps some other type of data was submitted in the form
          // like an image, or some other binary data.
          return "a file";
        }
      }
  
      const { url } = request;
      if (url.includes("form")) {
        return rawHtmlResponse(someForm);
      }
      if (request.method === "POST") {
        const reqBody = await readRequestBody(request);
        const retBody = `The request body sent in was ${reqBody.brochure.length}`;
        console.log("retbody = "+retBody)
        const leadid = await formtoairtable(reqBody)
        const backofficemailresponse = await sendemailtobackoffice(reqBody)
        const usermailresponse = await sendemailtorequester(reqBody.email, reqBody.name, reqBody.brochure, reqBody.userid) 
  
        const requrl = new URL(request.url)
        const templateurl = requrl.protocol+'//'+requrl.host+'/brochure-thanks/index' //'http://localhost:1313/brochures/'
        const thankstemplate = await fetch(templateurl);
        
        const options = {"type":"brochureRequest","useremail":reqBody.email} // replace useremail and userid from form submission and airtable respectively
            return new HTMLRewriter()
            .on('span.requestoremail', new ElementHandler(options))
            .transform(thankstemplate);
  
            //return new Response(retBody);
        }
    };