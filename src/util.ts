function IncludeFile(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function IncludeCss(filename: string) {
  return IncludeFile("static/css/" + filename + "CSS");
}

function IncludeJs(filename: string) {
  return IncludeFile("static/js/" + filename + "JS");
}

function IncludeHtml(filename: string) {
  return IncludeFile("view/" + filename);
}

function Include(filename: string, type: "css" | "js" | "html") {
  if (type === "css") {
    return IncludeCss(filename);
  } else if (type === "js") {
    return IncludeJs(filename);
  } else if (type === "html") {
    return IncludeHtml(filename);
  } else {
    throw new Error('Invalid include type. Use "css" or "js".');
  }
}

function TemplateWithNavBar(target: string, data, navbar_data) {
  const navbarTemplate = HtmlService.createTemplateFromFile("view/navbar");
  Object.assign(navbarTemplate, navbar_data);
  navbarTemplate.getUrl = getUrl;
  navbarTemplate.include = Include;
  const evaluatedNavbar = navbarTemplate.evaluate().getContent();

  const mainTemplate = HtmlService.createTemplateFromFile(target);
  Object.assign(mainTemplate, data);
  Object.assign(mainTemplate, {
    message: "",
    include: Include,
    evaluatedNavbar: evaluatedNavbar,
  });

  return mainTemplate;
}

function getUrl() {
  var url = ScriptApp.getService().getUrl();
  return url;
}

export { Include, TemplateWithNavBar };
