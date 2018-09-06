export class TetherOptions {
  tetherType: string;
  tetherSettings:Object = {};
  tetherOptions:Object = {};
  globalDefaults:Object = {
    classPrefix: "c-tether-"
  }
  _defaults = {
    modal: {
      overlay: {
        closeWhenClicked: true,
        class: null,
        backgroundColor: null,
        dismissConfirm: false
      },

      dialog: {
        style: {
          width: "40vw",
          height: "55vh",
          minHeight: "470px",
          maxWidth: "auto",
          backgroundColor: null
        },
        class: null
      },

      outsideClickIsActive: true,
      escapeKeyIsActive: true,
      dismissConfirm: false,
      dismissConfirmMessage: "Kapatmak istediğinize emin misiniz?",
      
      element: ".c-tether-dialog__content",
      target: ".c-tether-dialog",
      attachment: "middle center",
      targetAttachment: "middle center",

      constraints: [
        {
          to: 'scrollParent',
          pin: true
        },
        {
          to: 'window',
          attachment: 'together',
          pin: true
        }
      ]
    },
    drawer: {
      overlay: {
        closeWhenClicked: true,
        class: null,
        backgroundColor: null,
        dismissConfirm: false
      },

      dialog: {
        style: {
          width: "65vw",
          height: "100vh",
          backgroundColor: null
        },
        class: null
      },

      outsideClickIsActive: true,
      escapeKeyIsActive: true,
      dismissConfirm: false,
      dismissConfirmMessage: "Kapatmak istediğinize emin misiniz?",
      
      element: ".c-tether-dialog__content",
      target: ".c-tether-dialog",
      attachment: "top right",
      targetAttachment: "top right",

      constraints: [
        {
          to: 'scrollParent',
          pin: true
        },
        {
          to: 'window',
          attachment: 'together',
          pin: true
        }
      ]
    },
    context: {
      overlay: null,

      dialog: {
        style: null,
        class: null
      },

      outsideClickIsActive: true,
      escapeKeyIsActive: true,
      dismissConfirm: false,
      dismissConfirmMessage: "Kapatmak istediğinize emin misiniz?",
      
      element: ".c-tether-dialog__content",
      target: ".c-tether-dialog",
      attachment: "top right",
      targetAttachment: "top right",

      constraints: [
        {
          to: 'window',
          attachment: 'together',
          pin: true
        }
      ]
    },
    content: {
      overlay: null,

      dialog: {
        style: null,
        class: "c-tether-dialog__content--main"
      },

      outsideClickIsActive: false,
      escapeKeyIsActive: true,
      dismissConfirm: false,
      dismissConfirmMessage: null,
      
      element: ".c-tether-dialog__content",
      target: ".o-main-content",
      attachment: "top left",
      targetAttachment: "top left",

      constraints: [
        {
          to: 'scrollParent',
          pin: true
        },
        {
          to: 'window',
          attachment: 'together',
          pin: true
        }
      ]
    },
  }

  get settings():any { return this.tetherSettings };
  get type():string { return this.tetherType };

  constructor(type: string, options?:{}) {
    this.tetherType = type;
    this.tetherSettings = Object.assign({}, this._defaults[type], options);
    this.tetherSettings = Object.assign({}, this.tetherSettings, this.globalDefaults);
  }
}