#!/bin/bash

echo "=====================================================";
echo "";
echo "Building Angular project";
echo "";
echo "=====================================================";

# Create a default build
npm run build

# Move the output to the upper level of the folder dist
# so cap sync android knows the build output is there.
mv ./dist/move/browser/* ./dist

echo "=====================================================";
echo "";
echo "Syncing with Android with 'npx cap sync andriod'";
echo "";
echo "=====================================================";

# Finally, sync the output with the Android project.
npx cap sync android

echo "=====================================================";
echo "";
echo "Syncing with Android with 'npx cap sync ios'";
echo "";
echo "=====================================================";

# And sync the output with the iOS project.
npx cap sync ios