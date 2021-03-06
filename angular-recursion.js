/* 
 * An Angular service which helps with creating recursive directives.
 * @author Mark Lagendijk
 * @license MIT
 */
angular.module('RecursionHelper', []).factory('RecursionHelper', ['$compile', function($compile){
	return {
		/**
		 * Manually compiles the element, fixing the recursion loop.
		 * @param element
		 * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
		 * @returns An object containing the linking functions.
		 */
		compile: function(element, link, replace_existing){
			// Normalize the link parameter
			if(angular.isFunction(link)){
				link = { post: link };
			}

			// Break the recursion loop by removing the contents
			var contents = element.contents().remove();
			var compiledContents;
			return {
				pre: (link && link.pre) ? link.pre : null,
				/**
				 * Compiles and re-adds the contents
				 */
				post: function (scope, element, attributes, controller, transcludeFn) {
					// Compile the contents
					if(!compiledContents){
						compiledContents = $compile(contents);
					}
					// Re-add the compiled contents to the element
					var cloneAttachFn = function (clone) {
						if (replace_existing) {
							element.after(clone);
							element.hide();
							element = clone;
						} else {
							element.append(clone);
						}
					};
					var options = {
						parentBoundTranscludeFn: function (scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild) {
							transcludeFn.call(null, scopeToChild, cloneAttachFn, /*futureParentElement.is('tr') ? futureParentElement.parent() :*/ futureParentElement);
						}
					};
					compiledContents(scope, cloneAttachFn, options);

					// Call the post-linking function, if any
					if(link && link.post){
						link.post.call(null, scope, element, attributes, controller, transcludeFn);
					}
				}
			};
		}
	};
}]);
