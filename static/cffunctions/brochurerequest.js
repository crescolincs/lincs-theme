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
      /**
       * readRequestBody reads in the incoming request body
       * Use await readRequestBody(..) in an async function to get the string
       * @param {Request} request the incoming request to read from
       */
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
          // Perhaps some other type of data was submitted in the form like an image, or some other binary data.
          return "a file";
        }
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
      
        // Send email to team
      async function sendemailtobackoffice(request, formreceived) {
        var bodyofemail = '';
        for (const field in formreceived) {
          bodyofemail = bodyofemail + `${field}: ${formreceived[field]}\n`;
        }
        const emailbody = 
        {
          "from": {
              "email": "team@investlincolnshire.co.uk", "name": "Team Invest Lincs"
          },
              "to": [
          {"email": "crescolincs@gmail.com", "name": "Cresco Lincs"},
          {"email": "investment@lincolnshire.gov.uk", "name": "Investment"}
          ],
          "subject": "Invest Lincolnshire Enquiry from "+formreceived.name,
          "text": bodyofemail,//"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender,
          "html": bodyofemail.replaceAll('\n','<br>') //"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender
        }
        const result = await fetch(`https://api.mailersend.com/v1/email`, {
            method: 'POST',
            body: JSON.stringify(emailbody),
            headers: {
              'Authorization': 'Bearer '+env.MS_TKN,
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              
            }
          })
      };
         // Send email to Requestor of the download
         async function sendemailtorequester(request, toemail, toname, brochure, atid) {
          var bodyofemail = 'Thank you for your brochure request.\n\n You can safely download your '+brochure+' brochure from the following link.\n\n '+env.BROCHURE_DOWNLOADS+atid+'/'+brochure;
  
          const emailbody = 
          {
            "from": {
                "email": "team@investlincolnshire.co.uk", "name": "Team Invest Lincs"
            },
                "to": [
            {
                "email": toemail, "name": toname
            }
            ],
            "subject": "Your "+brochure+" brochure from Invest Lincolnshire",
            "text": bodyofemail,//"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender,
            "html": bodyofemail.replaceAll('\n','<br>') //"url.pathname "+requrl+" the request method was"+request.method+" you submitted the following email address "+formReceived.fields.email+" hidden name of the form "+formReceived.fields.sender
          }
          const result = await fetch(`https://api.mailersend.com/v1/email`, {
              method: 'POST',
              body: JSON.stringify(emailbody),
              headers: {
                'Authorization': 'Bearer '+env.MS_TKN,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                
              }
            })
        };     
      if (request.method === "POST") {
        const reqBody = await readRequestBody(request);
        //const retBody = `The request body sent in was ${reqBody}`;
        //console.log("retbody = "+retBody)
        //console.log("requestors email address   "+reqBody.email)
        const backofficemailresponse = await sendemailtobackoffice(request, reqBody) 
        const leadid = await formtoairtable(reqBody)
        //console.log("leadid: "+leadid)
        //const airtableJSON = await airtableresponse.json()
        
        const usermailresponse = await sendemailtorequester(request,  reqBody.email, reqBody.name, reqBody.brochure, leadid) 
        //console.log('redirecturl = '+redirecturl)
        const requrl = new URL(request.url)
        const templateurl = requrl.protocol+'//'+requrl.host+'/brochure-thanks/index' //'http://localhost:1313/brochures/'
        const thankstemplate = await fetch(templateurl);
        
        const options = {"type":"brochureRequest","useremail":reqBody.email} // replace useremail and userid from form submission and airtable respectively
            return new HTMLRewriter()
            .on('span.requestoremail', new ElementHandler(options))
            .transform(thankstemplate);
        
      } else if (request.method === "GET") {
        return new Response("The request was a GET");
      }
    };