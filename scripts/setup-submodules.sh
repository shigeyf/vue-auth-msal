#!/bin/bash

git submodule init

modules=$(cat .gitmodules | grep "^[[]submodule" .gitmodules | sed 's/\[submodule "\([^"]*\)"]/\1/')

for m in ${modules}
do
	url=$(git config -f .gitmodules --get submodule.$m.url)
	path=$(git config -f .gitmodules --get submodule.$m.path)
	sparseCheckout=$(git config -f .gitmodules --get submodule.$m.sparseCheckout)
	sparseCheckoutFile=$(git config -f .gitmodules --get submodule.$m.sparseCheckoutFile)

	#echo ${url}
	#echo ${path}
	#echo ${sparseCheckout}
	#echo ${sparseCheckoutFile}

	if [ ! -d .git/modules/${path} ]; then
		echo "No submodule's .git config dir"
		git clone --filter=blob:none --no-checkout ${url} ${path}
		git submodule absorbgitdirs
	fi

	git -C ${path} config core.sparseCheckout ${sparseCheckout}
	cp ${sparseCheckoutFile} .git/modules/${path}/info/sparse-checkout

	url=
	path=
	sparseCheckout=
	sparseCheckoutFile=
done

git submodule update
