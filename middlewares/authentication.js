/* Page password protection middleware */

exports.requiresLogin = function (req, res, next) {
	// If user is not logged in redirect him to the login page
	if (!req.isAuthenticated()) {
    	return res.redirect('/login');
	}
	
  	next();

};