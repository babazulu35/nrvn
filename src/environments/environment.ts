// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  name: "dev",
  production: false,
  api: {
    host : 'http://localhost/Nirvana.WebApi.BackOffice',
    boxoffice : 'http://localhost/Nirvana.WebApi',
    cms : 'http://localhost/Beeswax.WebApi',
    path: 'api/v1.0',
    cmspath: 'api/beeswax',
  },
  venued: {
    jsPath : "https://backstage-test.mobilet.com/venued/1.1/dist/js/venued.min.js"
  },
  emailValidation: {
    linkUrl: 'https://test.mobilet.com/validate-email'
  },
};


