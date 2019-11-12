<template>
<div class="card-asset" :class="[type]">
  <div class="remove-button" @click="emitRemove(idx)">削除</div>
  <div class="num-wrapper">
    <span>枚数：</span>
    <input class="num" type="number" :value="num" min="1" @input="onNumberInput">
    <span class="num-print">{{ num }}枚</span>
  </div>
  <div class="asset-wrapper">
    <span class="filename">{{ filenames.face === "" ? "ファイル名" : filenames.face }}</span>
    <div class="card-wrapper">
      <span>表</span>
      <div class="card face" data-asset-type="face" :style="size">
        <div class="droppable-wrapper" data-drop-target="face">
          <div class="droppable-area"
            @dragover.capture.prevent.stop
            @dragenter.prevent="onMouseEnter"
            @dragleave.prevent="onMouseLeave"
            @drop.prevent.stop="onDrop"
          ></div>
          <span v-show="dataurl.face === null">画像ファイル(jpg)をドラッグ＆ドロップしてください</span>
        </div>
        <img class="thumb" :src="dataurl.face">
      </div>
    </div>
  </div>
  <div class="asset-wrapper">
    <div class="card-wrapper">
      <span>裏</span>
      <div class="card back" data-asset-type="back" :style="size">
        <div class="droppable-wrapper" data-drop-target="back">
          <div class="droppable-area"
            @dragover.capture.prevent.stop
            @dragenter.prevent="onMouseEnter"
            @dragleave.prevent="onMouseLeave"
            @drop.prevent.stop="onDrop"
          ></div>
          <span v-show="dataurl.back === null">画像ファイル(jpg)をドラッグ＆ドロップしてください</span>
        </div>
        <img class="thumb" :src="dataurl.back">
      </div>
    </div>
    <span class="filename">{{ filenames.back === "" ? "ファイル名" : filenames.back }}</span>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { Dictionary } from 'vue-router/types/router';
import { CARD_SIZE } from '../const'

@Component
export default class CardAssets extends Vue {
  @Prop({ type: Number, default: -1 }) readonly idx!: number
  // 枚数
  @Prop({ type: Number, default: 0 }) readonly num!: number  
  // 表裏のファイル名
  @Prop({ type: Object,  default: () => { return { face: "", back: ""} } })
  readonly filenames!: Dictionary<string>
  // カード種別 "bridge" | "porker"
  @Prop({ type: String , default: "bridge" }) readonly type!: string
  // ファイルリーダインスタンス
  reader: FileReader = new FileReader();
  // 表示用画像DataURL
  dataurl: Dictionary<string | null> = { face: null, back: null};
  dropTarget: string | null = null;

  async onDrop(ev: DragEvent): Promise<any> {
    let type: string | undefined
    if(this.dropTarget === null)
      return
    else {
      type = this.dropTarget
      var parent: HTMLElement | null = (ev.target as HTMLElement).parentElement
    }
    
    if(ev.dataTransfer !== null) {
      let file: File = ev.dataTransfer.files[0]

      if(file.type.indexOf('image/') != 0)
        return
      
      this.emitUpdateFilename(file.name, type, this.idx)
      
      if(parent !== null)
        this.removeHoverClass(parent)
        
      await this.loadImage(file)
      await this.drawDataURLToCanvas(type)
    }
  }

  onMouseEnter(ev: MouseEvent): void {
    let parent: HTMLElement | null = (ev.target as HTMLElement).parentElement
    if(parent !== null) {
      let target: string | undefined = parent.dataset["dropTarget"]
      if(target !== undefined) {
        this.dropTarget = target
        this.addHoverClass(parent)
      }
    }
  }

  onMouseLeave(ev: MouseEvent): void {
    let parent: HTMLElement | null = (ev.target as HTMLElement).parentElement
    if(parent !== null) 
      this.removeHoverClass(parent)
    this.dropTarget = null
  }

  addHoverClass(elm: HTMLElement): void {
    elm.classList.add("onhover")
  }

  removeHoverClass(elm: HTMLElement): void {
    elm.classList.remove("onhover")
  }

  loadImage(file: File): Promise<any> {
    this.reader.readAsDataURL(file)
    return new Promise((resolve, reject) => {
      this.reader.addEventListener("loadend", () => resolve(), { once: true })
    })
  }

  drawDataURLToCanvas(target: string): Promise<any> {
    let img: HTMLImageElement = new Image()
    img.src = this.reader.result as string
    return new Promise((resolve, reject) => {
      img.onload = () => {
        let w = CARD_SIZE[this.type].width
        let h = CARD_SIZE[this.type].height
        let canvas:HTMLCanvasElement = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        let ctx = canvas.getContext('2d')
        if(ctx != null){         
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h)
          this.dataurl[target] = canvas.toDataURL("image/png")
          resolve()
        } else {
          reject()
        }
      }
    })
  }

  get size() {
    return { 
      width: CARD_SIZE[this.type].width + "px",
      height: CARD_SIZE[this.type].height + "px"
    }
  }
  
  @Emit('update-number')
  emitUpdateNumber(val: number, idx: number): void {}

  onNumberInput(ev: Event): void {
    if(ev.target == null)
      return
    this.emitUpdateNumber(parseInt((ev.target as HTMLInputElement).value, 10), this.idx)
  }

  @Emit('update-filename')
  emitUpdateFilename(name: string, kind: string, idx: number) {}

  @Emit("remove")
  emitRemove(idx: number): void {}

}
</script>

<style lang="sass" scoped>
.card-asset 
  position: relative
  display: flex
  flex-direction: column
  flex-basis: 25%
  margin-bottom: 16px
  padding-bottom: 16px
  border-bottom: 1px solid #ccc
  &:hover
    .remove-button
      display: block

  .card
    width: 100%
    height: 100%
    border: 1px dotted #ccc
    border-radius: 8px
    display: flex
    align-items: center
    position: relative

    span
      color: #8b8b8b
      font-size: 0.8rem

.asset-wrapper
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center

.card-wrapper
  display: flex
  flex-direction: row
  align-items: center
  justify-content: center
  margin-bottom: 8px
  .card 
    margin-left: 8px

.num-wrapper
  margin-bottom: 4px
  span.num-print
    display: none

input.num
  padding: 4px
  width: 80px

span.filename
  padding: 2px
  height: 1.5rem

.remove-button
  display: none
  position: absolute
  top: 0
  right: 0
  border: 1px solid #ccc
  border-radius: 8px
  padding: 4px 16px
  cursor: pointer
  font-size: 0.9rem
  &:hover
    background: #ff6969
    border-color: #9d5252
    color: #fff

.droppable-wrapper
  z-index: 10
  width: 100%
  height: 100%
  display: flex
  align-items: center
  position: absolute
  &.onhover
    box-shadow: 0px 2px 12px -2px rgb(52, 139, 177)
  span
    position: absolute

.droppable-area
  width: 100%
  height: 100%
  display: flex
  align-items: center
  z-index: 1

.thumb
  z-index: 1

@media print
  .num-wrapper
    input.num
      display: none
    span.num-print
      display: inline!important

  .remove-button
    display: none!important

  .card-asset
    margin-bottom: 64px
    padding-bottom: 64px
  
  .droppable-area
    display: none
</style>
