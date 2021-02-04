// 起動された時に呼ばれる関数を登録
window.addEventListener('load', () => {
  // ステージを整える
  initialize()

  // ゲームを開始する
  loop()
})

// ゲームの現在の状況
let mode
// ゲームの現在フレーム
let frame
// 何連鎖か
let combinationCount = 0

function initialize() {
  // 画像を準備
  PuyoImage.initialize()
  // ステージを準備
  Stage.initialize()
  // ユーザー操作の準備
  Player.initialize()
  // シーンを初期状態にセット
  Score.initialize()
  // スコア表示の準備
  mode = 'start'
  // フレームを初期化
  frame = 0
}

function loop() {
  switch(mode) {
    case 'start':
      // 最初は、もしかしたら空中にあるかもしれないぷよを自由落下させるところからスタート
      mode = 'checkFall'
      break
    
    case 'checkFall':
      // 落ちるかどうか判定
      if(Stage.checkFall()) {
        mode = 'fall'
      } else {
        // 落ちなければ、ぷよを消せるかどうか判定
        mode = 'checkErase'
      }
      break

    case 'fall':
      if(!Stage.fall()) {
        // 全て落ちきったらぷよを消せるかどうか判定する
        mode = 'checkErase'
      }
      break
    
    case 'checkErase':
      // 消せるかどうか判定する
      const eraseInfo = Stage.checkErase(frame)
      if (eraseInfo) {
        mode = 'erasing'
        combinationCount++
        // 得点を計算する
        Score.calculateScore(combinationCount, eraseInfo.piece, eraseInfo.color)
        Stage.hideZenkeshi()
      }else {
        if (Stage.puyoCount === 0 && combinationCount > 0) {
          // 全消しの処理
          Stage.showZenkeshi()
          Score.addScore(3600)
        }

        combinationCount = 0
        // 消せなかったら、新しいぷよを登場させる
        mode = 'newPuyo'
      }

      break

    case 'erasing':
      if (!Stage.erasing(frame)) {
        // 消し終わったら、再度落ちるかどうか判定
        mode = 'checkFall'
      }
      break

    case 'newPuyo':
      if (!Player.createNewPuyo()) {
        // 新しい操作用ぷよを作成できなかったらゲームオーバー
        mode = 'gameOver'
      } else {
        // プレイヤーが操作可能
        mode = 'playing'
      }

      break

    case 'playing':
      // プレイヤーが操作する
      const action = Player.playing(frame)
      mode = action
      break

    case 'moving':
      if (!Player.moving(frame)) {
        // 移動が終わったので操作可能にする
        mode = 'playing'
      }
      break

    case 'rotating':
      if (!Player.rotating(frame)) {
        // 回転が終わったので操作可能にする
        mode = 'playing'
      }
      break

    case 'fix':
      // 現在の位置でぷよを固定する
      Player.fix()
      // 固定したら、まず自由落下を確認する
      mode = 'checkFall'
      break

    case 'gameOver':
      // ばたんきゅーの準備をする
      PuyoImage.prepareBatankyu(frame)
      mode = 'batankyu'
      break

    case 'batankyu':
      PuyoImage.batankyu(frame)
      Player.batankyu()
      break
  }

  frame++
  // 1/60秒後にもう一度呼び出す
  requestAnimationFrame(loop)
}