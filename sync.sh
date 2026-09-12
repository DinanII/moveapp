#!/bin/bash

# Create a default build
npm run build

# Move the output to the upper level of the folder dist
# so cap sync android knows the build output is there.
mv ./dist/move/browser/* ./dist

# Finally, sync the output with the Android project.
npx cap sync android