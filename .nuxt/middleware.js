const middleware = {}

middleware['routeNavigationGuard'] = require('../middleware/routeNavigationGuard.js')
middleware['routeNavigationGuard'] = middleware['routeNavigationGuard'].default || middleware['routeNavigationGuard']

export default middleware
