# Forked from https://github.com/isaacs/npm/blob/v1.3.17/lib/utils/completion.sh
#!/bin/bash
###-begin-foundry-completion-###
#
# foundry command completion script
#
# Installation: foundry completion >> ~/.bashrc  (or ~/.zshrc)
# Or, maybe: foundry completion > /usr/local/etc/bash_completion.d/foundry
#

COMP_WORDBREAKS=${COMP_WORDBREAKS/=/}
COMP_WORDBREAKS=${COMP_WORDBREAKS/@/}
export COMP_WORDBREAKS

if type complete &>/dev/null; then
  _foundry_completion () {
    local si="$IFS"
    IFS=$'\n' COMPREPLY=($(COMP_CWORD="$COMP_CWORD" \
                           COMP_LINE="$COMP_LINE" \
                           COMP_POINT="$COMP_POINT" \
                           foundry completion -- "${COMP_WORDS[@]}" \
                           2>/dev/null)) || return $?
    IFS="$si"
  }
  complete -F _foundry_completion foundry
elif type compdef &>/dev/null; then
  _foundry_completion() {
    si=$IFS
    compadd -- $(COMP_CWORD=$((CURRENT-1)) \
                 COMP_LINE=$BUFFER \
                 COMP_POINT=0 \
                 foundry completion -- "${words[@]}" \
                 2>/dev/null)
    IFS=$si
  }
  compdef _foundry_completion foundry
elif type compctl &>/dev/null; then
  _foundry_completion () {
    local cword line point words si
    read -Ac words
    read -cn cword
    let cword-=1
    read -l line
    read -ln point
    si="$IFS"
    IFS=$'\n' reply=($(COMP_CWORD="$cword" \
                       COMP_LINE="$line" \
                       COMP_POINT="$point" \
                       foundry completion -- "${words[@]}" \
                       2>/dev/null)) || return $?
    IFS="$si"
  }
  compctl -K _foundry_completion foundry
fi
###-end-foundry-completion-###
