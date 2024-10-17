function IncludeFile(filename: string) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function IncludeCss(filename: string) {
  return IncludeFile("static/css/" + filename + "CSS");
}

function IncludeJs(filename: string) {
  return IncludeFile("static/js/" + filename + "JS");
}

function Include(filename: string, type: "css" | "js") {
  if (type === "css") {
    return IncludeCss(filename);
  } else if (type === "js") {
    return IncludeJs(filename);
  } else {
    throw new Error('Invalid include type. Use "css" or "js".');
  }
}

export { Include };
