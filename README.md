# Bananaz

Weekend sprint to build bananagrams to play with friends.

![lobby](https://github.com/safetyscissors/bananas/blob/master/home.jpg)

![gameplay](https://github.com/safetyscissors/bananas/blob/master/playing.jpg)

## This is

Bananagrams. A game played with scrabble pieces but no board for 10ppl. Its a js canvas game that relies on a host to keep track of everyone's states and syncs via websockets.
Reproduces a living room. Players control an arm that lets them move around the place, zoom in/out, and pick things up and place them anywhere.

## Some learnings

- Terrible lobby. Relying on one client being the host makes this very hard. Better to use a server api to list connected host clients.
- Custom controls like tracking mouse position don't work well with tablets.
- Animated how to play is nice.
- Number of messages being sent is a bit expensive. 1 game takes ~1M messages. Definitely need to separate the tick speed from the update speed. Runs a 20fps tick speed, 20fps render speed, 5fps update speed,
- Freeform controls are harder to follow for less computer savvy. Should find more intuitive movements.
- Freeform arm interactions are really fun.
- Captures the fun human element of looking around at other people's words and for them to see you looking.
- Having a separate camera/player/board/background layers definitely constitutes enough complexity to use a regular game render engine next time. Too much trig to debug easily.

## Rules

 - Players start with 15 tiles. Arrange tiles to make words vertically or horizontally.
 - When all tiles have been placed, say "peel" and everyone draws one tile from the middle.
