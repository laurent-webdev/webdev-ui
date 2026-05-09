class FormValidate {
  constructor() {
    if (FormValidate.initialized) return;
    FormValidate.initialized = true;
    document.addEventListener("submit", FormValidate.onSubmit);
  }
  static onSubmit(event) {
    const form = event.target;
    if (!form.matches('[data-ui="validate"]')) return;
    const canSubmit = form.dispatchEvent(new CustomEvent("formValidate:beforeSubmit", {
      bubbles: true,
      cancelable: true,
      detail: { form }
    }));
    if (!canSubmit) {
      event.preventDefault();
      return;
    }
    if (!form.checkValidity()) {
      event.preventDefault();
      form.classList.add("validated");
      form.dispatchEvent(new CustomEvent("formValidate:invalid", {
        bubbles: true,
        detail: { form }
      }));
    } else {
      form.dispatchEvent(new CustomEvent("formValidate:valid", {
        bubbles: true,
        detail: { form }
      }));
    }
  }
  static destroy() {
    document.removeEventListener("submit", FormValidate.onSubmit);
    FormValidate.initialized = false;
  }
}
export {
  FormValidate as default
};
