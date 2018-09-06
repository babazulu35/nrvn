export const environment = {
  name: "preprod",
  production: false,
  api: {
    host : 'https://backofficeapi-stage.backstage.solutions',
    boxoffice : 'https://api-stage.backstage.solutions',
   	cms : 'https://beeswax-webapi-stage.azurewebsites.net',
  	path: 'api/v1.0',
  	cmspath: 'api/beeswax',
  },
  venued: {
    jsPath : "https://backstage-stage.mobilet.com/venued/1.1/dist/js/venued.min.js"
  },
  emailValidation: {
    linkUrl: 'https://stage.mobilet.com/validate-email'
  },
};
