<script setup lang="ts">
import { Check, Save } from '@lucide/vue'
import { ref } from 'vue'
import {
  Button,
  ConfirmButton,
  PopoverMorph,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextMorph,
} from 'elastic-ui'

// TextMorph's own rule, shown by itself: "Save" becomes "Saved" in place (USAGE 3, "Appearing, or
// becoming").
const saved = ref(false)
const fruits = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']
</script>

<template>
  <article class="prose article py-10">
    <h1>Principles</h1>
    <p>
      "Clean interfaces where things transform instead of appearing." The rules the library is built by
      (<code>DECISIONS.md</code>) and used by (<code>USAGE.md</code>), quoted as they are written there, with a live
      example where one is best shown rather than described.
    </p>

    <h2>Philosophy</h2>

    <h3>Continuity: nothing appears or disappears without a transition</h3>
    <p>
      The interface behaves like a physical space: everything comes from somewhere and goes somewhere, so the eye can
      follow it. A click never swaps the whole screen at once.
    </p>

    <h3>Transform, not spectacle</h3>
    <p>
      Shape and position change with the one emphasized ease, and nothing more: no stretching text, no bouncing.
      Motion is there to explain what happened, not to show off.
    </p>

    <h3>Fewer boxes</h3>
    <p>
      Order comes from space, typography and color first. Borders and backgrounds only where they add something,
      such as an interactive surface or real grouping.
    </p>

    <h3>Accessible by default</h3>
    <p>Keyboard, Escape, focus and <code>prefers-reduced-motion</code>.</p>

    <h3>Objects that transform in place</h3>
    <p>
      The parts with the most character are small objects rather than widgets, a bin with its lid, a folder with its
      pages, a file with its folded corner, drawn with a light touch of skeuomorphism: a shape you recognise, a few
      parts that move as parts (the lid tips open, the pages fan out, an icon travels to its row), and nothing
      realistic beyond that. They change in their own place instead of opening something over the page: a delete asks
      in its own square, a bar grows into its list over its own card.
    </p>

    <h2>How objects are drawn</h2>

    <h3>Depth from tones, not shadows</h3>
    <p>
      A surface a tone lighter or deeper than the one it sits on gives it volume; what floats over the page (a
      popover, a menu, a dialog, a toast) stands on the raised surface with a hairline round it, and under it only a
      shadow so faint it is barely there.
    </p>

    <h3>Fields are trays</h3>
    <p>
      A place to write sits a tone off what holds it, with no line at rest; a soft line comes on hover; on focus the
      tray lifts to the raised tone (no dark line, no halo); invalid, the line turns red. A field that grows into a
      panel (Select, Combobox) stays a tray as it opens, its highlighted option a tone above.
    </p>
    <div class="not-prose story-stage rounded-[var(--radius-xl)] border border-border p-6">
      <Select class="w-56">
        <SelectTrigger><SelectValue placeholder="Pick a fruit" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="fruit in fruits" :key="fruit" :value="fruit">{{ fruit }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <h3>Split a shape rather than nest one in another</h3>
    <p>
      When a part opens into more, it divides into halves of different tone joined along a curve (the delete's
      answers running to the pill's own edge, with a tail pointing at the bin); a box inside a box reads as two
      things.
    </p>
    <div class="not-prose story-stage rounded-[var(--radius-xl)] border border-border p-6">
      <ConfirmButton label="Delete" />
    </div>

    <h3>Simplify an object down to its gesture</h3>
    <p>A bin without stripes, so its lid reads as it tips open. Fewer details, larger movements of its parts.</p>

    <h3>Nothing that moves crosses visible text</h3>
    <p>Words come into focus only once the pieces travelling past them have gone by.</p>

    <h2>Type</h2>

    <h3>Five sizes, no others</h3>
    <p>
      <code>text-display</code> (a page's one title), <code>text-title</code> (a panel's or section's),
      <code>text-copy</code> (text to read), <code>text-label</code> and <code>text-ui</code> (a line to act on or
      scan, and plain interface text), <code>text-meta</code> (dates, counts, hints). A size between two of them is
      one of them.
    </p>

    <h3>Three weights, each with a job</h3>
    <p>400 to read, 500 to act or scan, 600 to announce. Never bold, and weight never says how important something is.</p>

    <h3>Importance, in this order: colour, space, size, weight</h3>
    <p>
      <code>fg</code> for what matters, <code>fg-secondary</code> for what goes with it, <code>fg-muted</code> for
      what is beside the point. A secondary line is greyer, not smaller or thinner.
    </p>

    <h3>One thing leads</h3>
    <p>A screen has one line that catches the eye first; at most three sizes are in view at once.</p>

    <h2>Motion rules</h2>

    <h3>Close faster than open</h3>
    <p>
      Opening takes ~0.5s so the eye can follow where things come from; closing takes 0.3s, since on the way out you
      only want it gone.
    </p>

    <h3>Text never scales</h3>
    <p>
      Morphing parts animate their position only (<code>layout="position"</code>); boxes take their new size at once
      and text reflows. A scaled box is stretched text.
    </p>

    <h3>Morph or liquid: count the objects</h3>
    <p>
      One thing that changes its shape is a morph, of a real size: a button becoming its panel, a card its page, a
      field its list, a bin its question. One thing splitting into several, or several joining into one, is liquid.
      The two never play on the same piece at once.
    </p>

    <h3>A box that becomes a panel changes its real size</h3>
    <p>
      Its edges travel from the button's box to the panel's, taking the panel's radius on the way; it is never scaled
      into place. The box starts exactly on the button's box, placed there without moving, and only then grows.
    </p>
    <div class="not-prose story-stage rounded-[var(--radius-xl)] border border-border p-6">
      <PopoverMorph label="Share">
        <template #trigger>Share</template>
        <template #default="{ close }">
          <p class="font-medium">Share this page</p>
          <p class="mt-1 text-fg-secondary">Anyone with the link can read it.</p>
          <div class="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" @click="close">Cancel</Button>
            <Button size="sm" @click="close">Copy link</Button>
          </div>
        </template>
      </PopoverMorph>
    </div>

    <h3>One way to appear: a fade</h3>
    <p>
      Content that shows up fades in once the shape has nearly arrived, and fades out before it leaves. No wipes,
      slides or typewriters on top of a morph; that is too much motion.
    </p>

    <h3>Appearing is not becoming</h3>
    <p>
      Content that was not there comes in with <code>blur-in</code>. Text that was there and takes a new value, a
      label, a status or a count, turns into it with <code>TextMorph</code>: its shared letters travel to their new
      places.
    </p>
    <div class="not-prose story-stage rounded-[var(--radius-xl)] border border-border p-6">
      <Button :icon="saved ? Check : Save" variant="outline" @click="saved = !saved">
        <TextMorph :text="saved ? 'Saved' : 'Save'" />
      </Button>
    </div>

    <h3>Open from the true origin, and let it be taken back halfway</h3>
    <p>
      A box grows out of what was pressed, the very object looked at, never from a spot chosen for convenience; and a
      morph can be reversed while it plays: pressed again or Escape mid-way, it turns back from where it is rather
      than finishing first.
    </p>

    <h3>What is used all the time does not morph</h3>
    <p>
      A menu opened many times a minute, a tooltip, a context menu: it appears at once and goes at once, with only
      the choice acknowledged. The morph is kept for what happens now and then, where following the movement helps.
    </p>

    <h2>Using it</h2>

    <h3>Morph by default</h3>
    <p>
      Where there is a morphing version, use it. The library's personality is things turning into other things, and a
      plain panel appearing from nowhere is the exception, not the rule.
    </p>

    <h3>Icons where they help, not everywhere</h3>
    <p>
      An icon earns its place when it helps find something at a glance: buttons, menu items, inputs, and the first
      level of a navigation. Past that it is noise.
    </p>

    <h3>Colour: grey by default, the aurora for AI</h3>
    <p>The interface is grey. Colour means something, and there are only three kinds:</p>
    <ul>
      <li><strong>Outcomes</strong>: success, warning, danger, for what went well, what needs care, what went wrong.</li>
      <li><strong>The accent</strong>, for what you can act on or where you are.</li>
      <li><strong>The aurora</strong>, the one decorative colour, and only behind AI at work.</li>
    </ul>
  </article>
</template>
