(function () {
  var form = document.getElementById("web3-contact-form");
  if (!form || !window.fetch) {
    return;
  }

  var feedback = document.getElementById("contact-form-feedback");
  var submitButton = form.querySelector('button[type="submit"]');
  var endpoint = "https://api.web3forms.com/submit";
  var idleLabel = submitButton ? (submitButton.getAttribute("data-idle-label") || submitButton.textContent) : "";
  var busyLabel = submitButton ? (submitButton.getAttribute("data-busy-label") || "Sending…") : "";

  function setFeedback(message, type) {
    if (!feedback) {
      return;
    }

    feedback.hidden = false;
    feedback.textContent = message;
    feedback.setAttribute("role", type === "error" ? "alert" : "status");
    feedback.classList.remove("form-feedback-error", "form-feedback-success");
    feedback.classList.add(type === "success" ? "form-feedback-success" : "form-feedback-error");
  }

  function clearFeedback() {
    if (!feedback) {
      return;
    }

    feedback.hidden = true;
    feedback.textContent = "";
    feedback.classList.remove("form-feedback-error", "form-feedback-success");
  }

  function getFieldValue(selector) {
    var field = form.querySelector(selector);
    return field ? (field.value || "").trim() : "";
  }

  function setBusy(isBusy) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isBusy;
    submitButton.setAttribute("aria-disabled", String(isBusy));
    submitButton.textContent = isBusy ? busyLabel : idleLabel;
    form.setAttribute("aria-busy", String(isBusy));
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    clearFeedback();

    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback("Please complete name, email, and message before sending.", "error");
      return;
    }

    if (form.elements.botcheck && form.elements.botcheck.checked) {
      return;
    }

    setBusy(true);

    var formData = new FormData(form);
    var email = getFieldValue("#contact-email").toLowerCase();
    formData.set("replyto", email);
    formData.set("page_url", window.location.href);

    var payload = {};
    formData.forEach(function (value, key) {
      payload[key] = value;
    });

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!response.ok || data.success === false) {
            throw new Error(data.message || "request-failed");
          }
          return data;
        });
      })
      .then(function () {
        form.reset();
        setFeedback("Thanks, your message has been sent to Bottle Lake Bikes.", "success");
        if (feedback) {
          feedback.focus();
        }
      })
      .catch(function () {
        setFeedback("Sorry, we could not send your message right now. Please try again or email us directly.", "error");
      })
      .finally(function () {
        setBusy(false);
      });
  }, true);
}());
