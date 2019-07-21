<template>
<div id="editor">
  <h3>印刷指示書ジェネレータ</h3>
  <ul class="menu">
    <li><a href="#" @click.prevent="exportJson">json出力</a></li>
    <li>/</li>
    <li><a href="#">PDF出力用画面の表示</a></li>
  </ul>
  <div class="general">
    <div class="">
      カードサイズ
    </div>
    <div class="total">
      総枚数: {{ total }}枚
    </div>
  </div>
  <div class="assets">
    <card-assets v-for="(item, key) in assets" :key="key"
      :filenames="item.filenames"
      :num="item.number"
      :idx="key"
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

@Component({
  components: {
    "card-assets": Assets
  },
})

export default class Editor extends Vue {
  assets: CardAsset[] = []

  created(){
    this.addItem()
  }

  addItem(): void {
    let newitem = new CardAsset()
    this.assets.push(newitem)
  }

  exportJson(): void {
    const blob: Blob = new Blob([JSON.stringify(this.assets, null, " ")], { type: "application\/json"})
    const url: string = URL.createObjectURL(blob)
    let downloader = document.createElement("a")
    downloader.href = url
    downloader.download = 'index.json'
    downloader.click()
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

ul.menu
  margin: 12px
  padding: 0
  list-style-type: none
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

</style>

