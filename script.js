/* =========================================
   SAKTHI DENTAL CLINIC — JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* 1. Update copyright year */
  const yearElement = document.getElementById("currentYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* 2. Mobile navigation menu */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.textContent = "☰";
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }

  /* 3. Highlight the current navigation page */
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const linkPage = href.split("#")[0] || "index.html";

    if (linkPage === currentPage && !href.includes("#faqs")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  /* 4. Contact form validation */
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (formStatus) {
        formStatus.textContent = "";
        formStatus.style.color = "";
      }

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();

        if (formStatus) {
          formStatus.textContent =
            "Please complete the required fields with valid information.";
          formStatus.style.color = "#b42318";
        }

        return;
      }

      if (formStatus) {
        formStatus.textContent =
          "Your details are valid, but message delivery is not configured yet. Please contact the clinic directly.";
        formStatus.style.color = "#8a5a00";
      }
    });
  }

  /* 5. Clear phone validation messages when editing */
  document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener("input", () => {
      input.setCustomValidity("");
    });
  });

  /* =====================================
     6. BANNER IMAGE SLIDER
  ===================================== */

  const slider = document.getElementById("bannerSlider");

  if (slider) {
    const slides = Array.from(
      slider.querySelectorAll(".banner-slide")
    );

    const prevButton = slider.querySelector("#bannerPrev");
    const nextButton = slider.querySelector("#bannerNext");

    const dots = Array.from(
      slider.querySelectorAll(".banner-dot")
    );

    if (slides.length > 1 && prevButton && nextButton) {
      let currentIndex = 0;
      let timer = null;

      function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
          const isActive = i === currentIndex;

          slide.classList.toggle("active", isActive);
          slide.setAttribute("aria-hidden", String(!isActive));
        });

        dots.forEach((dot, i) => {
          const isActive = i === currentIndex;

          dot.classList.toggle("active", isActive);
          dot.setAttribute(
            "aria-current",
            isActive ? "true" : "false"
          );
        });
      }

      function stopAutoSlide() {
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      }

      function startAutoSlide() {
        stopAutoSlide();

        timer = setInterval(() => {
          showSlide(currentIndex + 1);
        }, 5000);
      }

      prevButton.addEventListener("click", () => {
        showSlide(currentIndex - 1);
        startAutoSlide();
      });

      nextButton.addEventListener("click", () => {
        showSlide(currentIndex + 1);
        startAutoSlide();
      });

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          showSlide(index);
          startAutoSlide();
        });
      });

      slider.addEventListener("mouseenter", stopAutoSlide);
      slider.addEventListener("mouseleave", startAutoSlide);

      slider.addEventListener("focusin", stopAutoSlide);

      slider.addEventListener("focusout", (event) => {
        if (!slider.contains(event.relatedTarget)) {
          startAutoSlide();
        }
      });

      // Display the first banner on page load.
      showSlide(0);
      startAutoSlide();

    } else {
      console.error(
        "Banner slider error: Add at least two .banner-slide elements and both arrow buttons inside #bannerSlider."
      );
    }
  }

});

/* ========================================
   SAKTHI DENTAL CLINIC APPOINTMENT FORM
======================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const treatmentInput = document.getElementById("treatment");
  const appointmentDateInput =
    document.getElementById("appointmentDate");
  const messageInput = document.getElementById("message");
  const formStatus = document.getElementById("formStatus");
  const submitButton = contactForm.querySelector(
    'button[type="submit"]'
  );

  // Prevent selecting a date before today.
  if (appointmentDateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    appointmentDateInput.min = `${year}-${month}-${day}`;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (
      !fullNameInput ||
      !emailInput ||
      !phoneInput ||
      !treatmentInput ||
      !appointmentDateInput ||
      !formStatus ||
      !submitButton
    ) {
      console.error("One or more appointment form fields are missing.");
      return;
    }

    const appointmentData = {
      patientName: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      treatment: treatmentInput.value,
      appointmentDate: appointmentDateInput.value,
      message: messageInput ? messageInput.value.trim() : "",
    };

    formStatus.hidden = false;
    formStatus.textContent = "Submitting your appointment request...";
    formStatus.style.color = "#555";
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
      const response = await fetch(
        "http://localhost:5000/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit your appointment."
        );
      }

      formStatus.textContent =
        "Thank you! Your appointment request has been submitted successfully. The clinic will contact you to confirm.";
      formStatus.style.color = "green";

      contactForm.reset();

      // Restore today's minimum date after resetting the form.
      if (appointmentDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        appointmentDateInput.min = `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error("Appointment submission error:", error);

      formStatus.textContent =
        error.message ||
        "Could not connect to the server. Please try again.";
      formStatus.style.color = "red";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Appointment Request";
    }
  });
}
