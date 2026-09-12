# Move

'Move' (a placeholder name) is an mobile application that lets the user track it's outside moving activities, like taking a walk, run or a tour on the bicycle. It is also possible
to record a (touristic) ride whilst driving a car or motorcycle. The activities will be stored locally on the user's device and the app will not send it anywhere else.

The application is currently in development and is not available in any application store (like the App store or in Google Play). The are no plans to publish the project there in the near future, this could change based on the project state and the need/interest into it. Move is currently considered a side project.

## Technology

This project is created as a hybrid mobile application that's capable to run on Android as well as iOS devices. However, the focus will be directed towards Android due to the
availability of development and testing resources.

Things to add

* The use of sync.sh and reason why it has been created.
* Standard commands, like `npm run start` or `ng start` and `npm run build` or `ng build`.

### Frameworks and languages

This project is created as an [Angular](https://angular.dev) application (not AngularJS), the cross-platform native runtime for webapps called [CapacitorJS](https://capacitorjs.com) is installed as an NPM-package. This so
the frontend website developed in Angular can run as an application on the user's device and access components like the GPS/Location, Camera (if desired so) and it's own storage
directory.

The Angular readme has it's own file [[angular.md]].

**API's**

Here some Capacitor API's the projects uses or are API's I am planning to include

* https://capacitorjs.com/docs/apis/background-runner
* https://capacitorjs.com/docs/apis/filesystem
* https://capacitorjs.com/docs/apis/geolocation