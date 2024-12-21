echo "======= Removing old "
#rm -rf ./package.json
#rm -rf ./pnpm-workspace.yaml
#rm -rf ./turbo.json
#rm -rf ./node_modules
#rm -rf ./agent
#rm -rf ./packages
#rm -rf ./scripts
#rm -rf ./characters

echo "======= Copying new "
#cp -rf /eliza-src/package.json .
#cp -rf /eliza-src/pnpm-workspace.yaml .
#cp -rf /eliza-src/.npmrc ./
cp -rf /eliza-src/turbo.json .
cp -rf /eliza-src/node_modules .
cp -rf /eliza-src/agent .
cp -rf /eliza-src/packages .
cp -rf /eliza-src/scripts .
cp -rf /eliza-src/characters .

echo "======= Done "
