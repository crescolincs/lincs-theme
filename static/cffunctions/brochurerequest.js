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
        // Perhaps some other type of data was submitted in the form
        // like an image, or some other binary data.
        return "a file";
      }
    }
    async function formtoairtable(formReceived){
      var airtablejson =`{
        "fields": {
          "Name": "${formReceived.name}",
          "email": "${formReceived.email}",
          "policy-agreed": true,
          "from-form": "${formReceived.page}",
          "brochure-requested": "${formReceived.brochure}"
        }
      }`
      //console.log(airtablejson)
      const airtableresponse = await fetch(`https://api.airtable.com/v0/appTDInc67J2LFy2g/tblE0z8AesoW6O0pw`, {
         method: 'POST',
         body: airtablejson,
         headers: {
         'Authorization': 'Bearer '+env.AT_TKN,
         'Content-Type': 'application/json',
         'X-Requested-With': 'XMLHttpRequest',
         }
       })
      return airtableresponse
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
        {
            "email": "crescolincs@gmail.com", "name": "Cresco Lincs"
        }
        ],
        "subject": "Invest Lincolnshire Enquiry from "+formreceived.sender,
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
       // Send email to Requestor
       async function sendemailtorequester(request, toemail, toname, brochure, atid) {
        var bodyofemail = 'You can download your brochure from https://brochures.pages.dev/sendbrochures/'+atid+'/'+brochure;

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
          "subject": "Your ${brochure} brochure from Invest Lincolnshire",
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
      const retBody = `The request body sent in was ${reqBody}`;
      console.log("retbody = "+retBody)
      console.log("requestors email address   "+reqBody.email)
      const backofficemailresponse = await sendemailtobackoffice(request, reqBody) 
      const airtableresponse = await formtoairtable(reqBody)
      const airtableJSON = await airtableresponse.json()
      
      const usermailresponse = await sendemailtorequester(request,  reqBody.email, reqBody.name, reqBody.brochure, airtableJSON.id) 
      //console.log('redirecturl = '+redirecturl)
      return Response.redirect('https://brochures.pages.dev/sendbrochures/'+airtableJSON.id+'/'+reqBody.brochure);
      
    } else if (request.method === "GET") {
      return new Response("The request was a GET");
    }
  };