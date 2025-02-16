document.addEventListener('DOMContentLoaded', async () => {
  const id0Input = document.getElementById('id0-input');
  const saveId0Button = document.getElementById('save-id0-button');
  const idDisplay = document.getElementById('id-display');
  const id0Value = document.getElementById('id0-value');
  const id1Value = document.getElementById('id1-value');
  const inputContainer = document.getElementById('input-container');

  // 初回ロード時にストレージからID0とID1を取得して、UIの状態を更新する
  chrome.storage.local.get(['ID0', 'ID1'], (result) => {
    if (result.ID0 && result.ID1) {
      // 両方のIDが存在する場合は、表示用のUIを表示する
      id0Value.textContent = result.ID0;
      id1Value.textContent = result.ID1;
      inputContainer.classList.add('hidden');
      idDisplay.classList.remove('hidden');
    } else {
      // ID1が存在しなければ生成し、保存する（8桁のランダム英数字）
      if (!result.ID1) {
        const generatedId1 = generateRandomId(8);
        chrome.storage.local.set({ ID1: generatedId1 }, () => {
          id1Value.textContent = generatedId1;
        });
      }
      // ID0が存在しなければ、入力欄を表示する
      if (!result.ID0) {
        inputContainer.classList.remove('hidden');
        idDisplay.classList.add('hidden');
      }
    }
  });

  // saveId0Button をクリックすると、入力されたID0をストレージに保存し、UIを更新する
  saveId0Button.addEventListener('click', () => {
    const id0 = id0Input.value.trim();
    if (id0) {
      chrome.storage.local.set({ ID0: id0 }, () => {
        id0Value.textContent = id0;
        chrome.storage.local.get('ID1', (result) => {
          id1Value.textContent = result.ID1;
          inputContainer.classList.add('hidden');
          idDisplay.classList.remove('hidden');
        });
      });
    } else {
      alert('ID0を入力してください。');
    }
  });

  // 8桁のランダムな英数字を生成する関数
  function generateRandomId(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
});