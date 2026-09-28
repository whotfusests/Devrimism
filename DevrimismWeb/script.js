document.addEventListener("DOMContentLoaded", () => {
  initFamilyTree();
  initNavigation();
  initTimeline();
  initBackToTop();
});


/* =========================================
   FAMILY TREE
   ========================================= */

async function initFamilyTree() {
  const familyTree = document.getElementById("family-tree");

  if (!familyTree) {
    return;
  }

  try {
    /*
     * First use the normal path.
     * Only try the fallback if the file is not found.
     */
    let response = await fetch("./data/family.xml", {
      cache: "no-cache"
    });

    if (!response.ok) {
      const fallbackURL = new URL(
        "./Devrimism/data/family.xml",
        window.location.origin
      );

      response = await fetch(fallbackURL.href, {
        cache: "no-cache"
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(
      xmlText,
      "application/xml"
    );

    const parserError = xml.querySelector("parsererror");

    if (parserError) {
      throw new Error("Invalid XML");
    }

    const family = xml.querySelector("family");

    if (!family) {
      throw new Error("Missing <family> element");
    }

    familyTree.innerHTML = "";

    const children = Array.from(family.children);

    let generationNumber = 0;

    children.forEach((element, index) => {

      /* -----------------------------------------
         GENERATION
         ----------------------------------------- */

      if (element.tagName.toLowerCase() === "generation") {
        generationNumber++;

        const generation = document.createElement("div");

        generation.className = "family-generation";
        generation.dataset.generation = generationNumber;

        const people = Array.from(
          element.querySelectorAll(":scope > person")
        );

        people.forEach(person => {
          generation.appendChild(
            createFamilyCard(person)
          );
        });

        familyTree.appendChild(generation);


        /* ---------------------------------------
           RELATIONSHIP BETWEEN GENERATIONS
           --------------------------------------- */

        const nextElement = children[index + 1];

        if (
          nextElement &&
          nextElement.tagName.toLowerCase() === "generation"
        ) {
          familyTree.appendChild(
            createTreeConnector("CHILDREN")
          );
        }

        if (
          nextElement &&
          nextElement.tagName.toLowerCase() === "generation-gap"
        ) {
          familyTree.appendChild(
            createTreeConnector("")
          );
        }
      }


      /* -----------------------------------------
         GENERATION GAP
         ----------------------------------------- */

      else if (
        element.tagName.toLowerCase() === "generation-gap"
      ) {
        const gap = document.createElement("div");

        gap.className = "family-generation-gap";

        gap.textContent = element.textContent.trim();

        familyTree.appendChild(gap);


        /* ---------------------------------------
           CONNECT GAP TO NEXT GENERATION
           --------------------------------------- */

        const nextElement = children[index + 1];

        if (
          nextElement &&
          nextElement.tagName.toLowerCase() === "generation"
        ) {
          familyTree.appendChild(
            createTreeConnector(
              "7TH-GENERATION DESCENDANTS"
            )
          );
        }
      }
    });

  } catch (error) {
    console.error("Family tree error:", error);

    familyTree.innerHTML = `
      <div class="family-error">
        Unable to load the family tree.
        Make sure <strong>data/family.xml</strong>
        exists and the page is being served through HTTP.
      </div>
    `;
  }
}


/* =========================================
   CREATE FAMILY CARD
   ========================================= */

function createFamilyCard(person) {
  const nameElement = person.querySelector(":scope > name");
  const imageElement = person.querySelector(":scope > image");
  const descriptionElement =
    person.querySelector(":scope > description");


  /* -----------------------------------------
     FIELDS
     ----------------------------------------- */

  /*
   * Only use defaults when the XML field
   * itself does not exist.
   */

  const name = nameElement
    ? nameElement.textContent.trim() || "Unknown"
    : "Unknown";

  const image = imageElement
    ? imageElement.textContent.trim()
    : "";

  const description = descriptionElement
    ? descriptionElement.textContent.trim() ||
      "No description available."
    : "No description available.";


  /* -----------------------------------------
     CARD
     ----------------------------------------- */

  const card = document.createElement("article");

  card.className = "family-card";

  card.setAttribute("tabindex", "0");

  card.setAttribute("role", "button");

  card.setAttribute(
    "aria-label",
    `Open information about ${name}`
  );


  /* -----------------------------------------
     IMAGE
     ----------------------------------------- */

  if (image) {
    const img = document.createElement("img");

    /*
     * Keep the URL from the XML exactly as it is.
     * No rewriting of existing image paths.
     */
    img.src = image;

    img.alt = name;

    img.loading = "lazy";

    img.decoding = "async";

    img.onerror = () => {
      /*
       * The field existed, so don't substitute
       * another URL. Just hide the broken image.
       */
      img.style.display = "none";
    };

    card.appendChild(img);
  }


  /* -----------------------------------------
     NAME
     ----------------------------------------- */

  const title = document.createElement("h3");

  title.textContent = name;

  card.appendChild(title);


  /* -----------------------------------------
     POPUP
     ----------------------------------------- */

  const openPopup = () => {
    createFamilyPopup(
      name,
      image,
      description
    );
  };

  card.addEventListener("click", openPopup);

  card.addEventListener("keydown", event => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openPopup();
    }
  });


  return card;
}


/* =========================================
   TREE CONNECTOR
   ========================================= */

function createTreeConnector(label) {
  const connector = document.createElement("div");

  connector.className = "family-tree-connector";

  if (!label) {
    connector.classList.add("silent");
  }

  if (label) {
    const text = document.createElement("span");

    text.textContent = label;

    connector.appendChild(text);
  }

  return connector;
}


/* =========================================
   FAMILY POPUP
   ========================================= */

function createFamilyPopup(name, image, description) {

  /* -----------------------------------------
     REMOVE EXISTING POPUP
     ----------------------------------------- */

  const oldPopup =
    document.querySelector(".family-popup");

  if (oldPopup) {
    oldPopup.remove();
  }


  /* -----------------------------------------
     POPUP
     ----------------------------------------- */

  const popup = document.createElement("div");

  popup.className = "family-popup";

  popup.setAttribute("role", "dialog");

  popup.setAttribute("aria-modal", "true");

  popup.setAttribute("aria-label", name);


  /* -----------------------------------------
     CONTENT
     ----------------------------------------- */

  const content =
    document.createElement("div");

  content.className =
    "family-popup-content";


  /* -----------------------------------------
     CLOSE BUTTON
     ----------------------------------------- */

  const closeButton =
    document.createElement("button");

  closeButton.className =
    "family-popup-close";

  closeButton.type = "button";

  closeButton.textContent = "×";

  closeButton.setAttribute(
    "aria-label",
    "Close"
  );


  /* -----------------------------------------
     IMAGE
     ----------------------------------------- */

  if (image) {
    const popupImage =
      document.createElement("img");

    /*
     * Again, keep the image URL exactly
     * as it came from the XML.
     */
    popupImage.src = image;

    popupImage.alt = name;

    popupImage.loading = "eager";

    popupImage.decoding = "async";

    popupImage.onerror = () => {
      popupImage.style.display = "none";
    };

    content.appendChild(popupImage);
  }


  /* -----------------------------------------
     NAME
     ----------------------------------------- */

  const heading =
    document.createElement("h2");

  heading.textContent = name;


  /* -----------------------------------------
     DESCRIPTION
     ----------------------------------------- */

  const paragraph =
    document.createElement("p");

  paragraph.textContent = description;


  content.appendChild(closeButton);
  content.appendChild(heading);
  content.appendChild(paragraph);

  popup.appendChild(content);

  document.body.appendChild(popup);


  /* -----------------------------------------
     CLOSE FUNCTION
     ----------------------------------------- */

  const closePopup = () => {
    popup.remove();

    document.body.style.overflow = "";

    document.removeEventListener(
      "keydown",
      escapeHandler
    );
  };


  /* -----------------------------------------
     ESCAPE HANDLER
     ----------------------------------------- */

  const escapeHandler = event => {
    if (event.key === "Escape") {
      closePopup();
    }
  };


  /* -----------------------------------------
     EVENTS
     ----------------------------------------- */

  closeButton.addEventListener(
    "click",
    closePopup
  );

  popup.addEventListener("click", event => {
    if (event.target === popup) {
      closePopup();
    }
  });

  document.addEventListener(
    "keydown",
    escapeHandler
  );


  /* -----------------------------------------
     STOP PAGE SCROLLING
     ----------------------------------------- */

  document.body.style.overflow = "hidden";

  closeButton.focus();
}


/* =========================================
   NAVIGATION
   ========================================= */

function initNavigation() {
  const links = document.querySelectorAll(
    ".top-nav nav a"
  );

  if (!links.length) {
    return;
  }


  /* -----------------------------------------
     CLICK STATE
     ----------------------------------------- */

  links.forEach(link => {
    link.addEventListener("click", () => {

      links.forEach(item => {
        item.classList.remove("active");
      });

      link.classList.add("active");
    });
  });


  /* -----------------------------------------
     ACTIVE SECTION
     ----------------------------------------- */

  const sections = Array.from(
    document.querySelectorAll("main section[id]")
  );

  if (!sections.length) {
    return;
  }


  const observer = new IntersectionObserver(
    entries => {

      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio -
            a.intersectionRatio
        );

      if (!visible.length) {
        return;
      }

      const id = visible[0].target.id;

      links.forEach(link => {

        const target =
          link.getAttribute("href");

        link.classList.toggle(
          "active",
          target === `#${id}`
        );
      });
    },
    {
      rootMargin:
        "-125px 0px -55% 0px",

      threshold: [
        0.05,
        0.2,
        0.4,
        0.7
      ]
    }
  );


  sections.forEach(section => {
    observer.observe(section);
  });
}


/* =========================================
   TIMELINE
   ========================================= */

function initTimeline() {
  const items = document.querySelectorAll(
    ".ib-timeline p"
  );

  if (!items.length) {
    return;
  }

  items.forEach(item => {

    item.addEventListener("click", () => {

      items.forEach(other => {
        other.classList.remove("selected");
      });

      item.classList.add("selected");
    });
  });
}


/* =========================================
   BACK TO TOP
   ========================================= */

function initBackToTop() {
  const button =
    document.getElementById("back-to-top");

  if (!button) {
    return;
  }


  /* -----------------------------------------
     SHOW / HIDE
     ----------------------------------------- */

  window.addEventListener(
    "scroll",
    () => {

      if (window.scrollY > 400) {
        button.classList.add("visible");
      } else {
        button.classList.remove("visible");
      }
    },
    {
      passive: true
    }
  );


  /* -----------------------------------------
     CLICK
     ----------------------------------------- */

  button.addEventListener("click", () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}