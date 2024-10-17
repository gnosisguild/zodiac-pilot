This is an empty web app running under https://connect.pilot.gnosisguild.org to allow connecting to the user's wallet extension.

It's sole purpose is having a host for connecting to the wallet.
Since extensions don't have access to injected wallets, Pilot will load this empty site in an iframe injecting a script to use it as a bridge to the wallet.
