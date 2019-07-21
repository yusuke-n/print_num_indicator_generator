<template>
<div id="editor">
  <header>
  <h3>印刷指示書ジェネレータ</h3>
  <div class="general">
    <div class="card-size">
      <span>カードサイズ：</span>
      <ul>
        <li class="size-item">
          <input type="radio" name="type" v-model="size" value="bridge"/>
          <span>ブリッジ</span>
        </li>
        <li class="size-item">
          <input type="radio" name="type" v-model="size" value="porker"/>
          <span>ポーカー</span>
        </li>
      </ul>
    </div>
    <div class="total">
      総枚数： {{ total }}枚
    </div>
    <ul class="menu">
      <li><a href="#" @click.prevent="exportJson">json出力</a></li>
      <li>/</li>
      <li><a href="#">印刷プレビュー</a></li>
    </ul>
  </div>
  </header>
  <div class="assets">
    <card-assets v-for="(item, key) in assets" :key="key"
      :filenames="item.filenames"
      :num="item.number"
      :idx="key"
      :type="size"
      @update-filename="updateFilename"
      @update-number="updateNumber"
      @remove="remove"
    />
    <div class="add">
      <span @click="addItem">カードの追加</span>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Assets from '../components/CardAssets.vue';
import CardAsset from '../CardAsset'; 
import Exportable from '../ExportObject';

@Component({
  components: {
    "card-assets": Assets
  },
})

export default class Editor extends Vue {
  assets: CardAsset[] = []
  size: string = "bridge"

  created(){
    this.addItem()
  }

  addItem(): void {
    let newitem = new CardAsset()
    this.assets.push(newitem)
  }

  exportJson(): void {
    var exportable: Exportable  = {
      size: this.size,
      cards: []
    } 
    this.assets.forEach((el) => {
      exportable.cards.push({ 
        front: el.filenames.face,
        reverse: el.filenames.back,
        num: el.number
      })
    })
    const blob: Blob = new Blob([JSON.stringify(exportable, null, " ")], { type: "application\/json"})
    const url: string = URL.createObjectURL(blob)
    let downloader = document.createElement("a")
    downloader.setAttribute("type", "hidden");
    downloader.href = url
    downloader.download = 'index.json'
    document.body.appendChild(downloader)
    downloader.click()
    downloader.remove()
    URL.revokeObjectURL(url)    
  }

  copyFrom(idx: number): CardAsset {
    let old: CardAsset = this.assets[idx]
    let newobj: CardAsset = new CardAsset(old.filenames, old.number)
    return newobj
  }

  updateFilename(name: string, kind: string, idx: number): void {
    let newitem = this.copyFrom(idx)
    newitem.filenames[kind] = name
    this.assets.splice(idx, 1, newitem)
  }

  updateNumber(val: number, idx: number): void{
    let newitem = this.copyFrom(idx)
    newitem.number = val
    this.assets.splice(idx, 1, newitem)
  }

  remove(idx: number): void {
    this.assets.splice(idx, 1)
  }

  get total(): number {
    return this.assets.reduce((total, currentItem) => total + currentItem.number, 0)
  }

}
</script>

<style lang="sass" scoped>
.row
  display: flex
  flex-direction: row

ul
  margin: 0
  padding: 0
  list-style-type: none

ul.menu
  margin: 12px
  padding: 0
  display: flex
  flex-direction: row
  align-items: center
  justify-content: center
  li
    margin: 0 4px

.assets
  display: flex
  flex-direction: row
  flex-wrap: wrap

.add
  margin-bottom: 16px
  min-height: 340px
  display: flex
  align-items: center
  flex-basis: 25%
  justify-content: center
  span
    display: block
    padding: 12px 24px
    border: 1px solid #ccc
    border-radius: 8px
    cursor: pointer
    &:hover
      background: #f2f2f2

.general, .card-size, .card-size ul
  display: flex
  flex-direction: row
  justify-content: center
  align-items: center
  div
    margin: 12px

.card-size ul

@media print
  html 
    margin: 0
    padding: 0
  
  header 
    display: none!important

  .add
    display: none
</style>

