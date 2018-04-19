#!/usr/bin/env sed -f
s/^[[:blank:]]*//
s/[[:blank:]]*$//
s/\\/\\\\/g
s/'/'"'"'/g
s/^\(.*\)$/'\1'/
