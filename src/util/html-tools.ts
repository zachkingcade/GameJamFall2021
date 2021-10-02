/**
 * Transforms and HTML string into the objects it represents and returns the
 * first element in the list. This should not be used for groups of HTML
 * elements, but rather a single element or container.
 * @param htmlString HTML representing a single element
 * 
 * Credit:
 * The original version of this function came from Stack Overflow user Mark
 * Amery.
 * Linked below is the question on Stack Overflow, and the user's profile.
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
 * https://stackoverflow.com/users/1709587/mark-amery
 */
export function stringToHTMLElement(htmlString: string): HTMLElement {
    var template = document.createElement('template');
    htmlString = htmlString.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = htmlString;
    return <HTMLElement>template.content.firstChild;
}

/**
 * Transforms and HTML string into the objects it represents and returns the
 * list of elements.
 * @param htmlString HTML representing any number of sibling elements
 * 
 * Credit:
 * The original version of this function came from Stack Overflow user Mark
 * Amery.
 * Linked below is the question on Stack Overflow, and the user's profile.
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
 * https://stackoverflow.com/users/1709587/mark-amery
 */
export function stringtoHTMLArray(htmlString: string): HTMLElement[] {
    var template = document.createElement('template');
    template.innerHTML = htmlString;
    let list = [];
    template.content.childNodes.forEach(
        (child) => {
            list.push(<HTMLElement>child);
        }
    )
    return list;
}
