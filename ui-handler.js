window.onload = async () => {
  await autoInsertCharMaster();
  refreshTable();
};

async function refreshTable() {
  await SQLiteLoader.init();
  await SQLiteLoader.loadFromIndexedDB();
  populateDropdown();
  const cards = SQLiteLoader.getAllCards();
  const tbody = document.querySelector("#card-table tbody");
  tbody.innerHTML = "";

  cards.forEach(card => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${card["キャラクターID"]}</td>
      <td>${card["キャラクター名"] || "不明"}</td>
      <td>${card["レアリティ"]}</td>
      <td>${card["カード名"]}</td>
      <td>${card["カードIndex1"]}</td>
      <td>${card["カードIndex2"]}</td>
      <td>
        <button onclick="editCard(${card['キャラクターID']})">編集</button>
        <button onclick="deleteCard(${card['キャラクターID']})">削除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateDropdown() {
  const select = document.getElementById("charId");
  select.innerHTML = "";
  const list = SQLiteLoader.getCharList();
  list.forEach(([id, name]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${id} - ${name}`;
    select.appendChild(option);
  });
}

async function autoInsertCharMaster() {
  await SQLiteLoader.init();
  await SQLiteLoader.loadFromIndexedDB();

  const existing = SQLiteLoader.getCharList();
  if (existing.length === 0) {
    // charlist.json を fetch で読み込み
    const response = await fetch("charlist.json");
    const raw = await response.text();

    // JSONパース（charid="1000" のような形式を修正）
    const cleaned = raw
      .replace(/charid=/g, '"charid":')
      .replace(/charname-/g, '"charname":')
      .replace(/([{,])\s*/g, '$1')
      .replace(/}\s*]/, '}]'); // 最後のカンマを除去

    const charList = JSON.parse(cleaned);
    SQLiteLoader.insertCharMaster(charList);
    SQLiteLoader.exportToIndexedDB();
    console.log("キャラクターマスタを初期投入しました");
  }
}
