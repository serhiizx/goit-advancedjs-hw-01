const form = document.querySelector('.feedback-form');
const formMessage = document.querySelector('.feedback-form .form-message');
const FORM_DATA_KEY = 'feedback-form-state';
const formData = {
  email: '',
  message: '',
};

function main() {
  restoreForm();

  form.addEventListener('submit', event => {
    event.preventDefault();

    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!email || !message) {
      showMessage('error', '⚠️ Fill please all fields');
    } else {
      showMessage('success', 'Form saved 👌');
    }

    saveForm();
  });
  form.addEventListener('input', event => {
    const { name, value } = event.target;

    formData[name] = value;
  });
}

main();

function saveForm() {
  formData.email = formData.email.trim();
  formData.message = formData.message.trim();
  localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
}

function loadSavedData() {
  try {
    const data = localStorage.getItem(FORM_DATA_KEY);

    if (!data) {
      return {};
    }

    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function restoreForm() {
  const data = loadSavedData();

  for (const field in data) {
    const element = form.elements[field];

    if (element) {
      formData[field] = data[field];
      element.value = data[field];
    }
  }
}

function showMessage(type, message) {
  formMessage.className = '';
  formMessage.classList.add('form-message', 'visible', `form-${type}`);
  formMessage.innerText = message;

  setTimeout(() => {
    formMessage.innerText = '';
    formMessage.classList.remove('visible', `form-${type}`);
  }, 3000);
}
