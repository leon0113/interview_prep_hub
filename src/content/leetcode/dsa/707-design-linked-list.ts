import { patterns } from '../patterns';
import type { LcProblem } from '../schema';

const traverse = patterns.find((p) => p.id === 'linked-list-traversal')!.templates[0]!;

const problem: LcProblem = {
  id: 'lc-707-design-linked-list',
  number: 707,
  title: 'Design Linked List',
  slug: '707-design-linked-list',
  category: 'dsa',
  difficulty: 'Medium',
  url: 'https://leetcode.com/problems/design-linked-list/',
  patternId: 'linked-list-traversal',
  patternLabel: 'Linked List Design (walk to index - 1, keep size)',
  topicId: 'linked-list',
  tags: ['linked-list', 'design', 'traversal'],
  solvedIn: ['javascript'],
  dateAdded: '2026-11-16',

  problem: {
    oneLineReminder:
      '`size` দিয়ে index check, index 0 আর index == size আলাদা case; বাকি সব জায়গায় `curr`-কে **index - 1** পর্যন্ত হাঁটাও, তারপর `.next` বদলাও।',
    statementBn:
      'নিজের একটা singly linked list class বানাতে হবে: `get(index)` (না থাকলে `-1`), `addAtHead(val)`, `addAtTail(val)`, `addAtIndex(index, val)` (index == length হলে শেষে যোগ, length-এর বেশি হলে কিছুই না), আর `deleteAtIndex(index)` (index ঠিক থাকলে মুছে দাও)। Index 0 থেকে শুরু।',
    realLifeExample:
      'একটা ট্রেন: প্রতিটা বগি একটা node, হুক হলো `next`। নতুন বগি মাঝে জুড়তে চাইলে যেখানে বসাবে তার **আগের** বগির কাছে যেতে হয়: নতুন বগির হুক পরের বগিতে লাগাও, তারপর আগের বগির হুক নতুন বগিতে। ইঞ্জিন (`head`) কখনো হারানো যাবে না, আর বগি গুনে রাখলে (`size`) প্রতিবার গুনতে হয় না।',
    samples: [
      {
        input: `["MyLinkedList","addAtHead","addAtTail","addAtIndex","get","deleteAtIndex","get"]
[[],[1],[3],[1,2],[1],[1],[1]]`,
        output: '[null,null,null,null,2,null,3]',
        note: 'list: 1 → 1→3 → 1→2→3 → get(1)=2 → 1→3 → get(1)=3',
      },
    ],
  },

  approach: {
    triggers: [
      '"Design / implement a linked list" with get / add / delete by index',
      'index-based operations on nodes: walk from head, stop one node early',
    ],
    bruteForce:
      'ভেতরে একটা JS array রেখে `splice` দিয়ে সব করা যায়, কিন্তু তাহলে linked list বানানো হলো না (interviewer এটাই দেখতে চায়), আর মাঝখানে insert/delete-এ array element সরাতে হয়।',
    idea: 'একটা `Node(val)` (val + next) আর class-এ `head` ও `size`। `size` থাকায় index valid কিনা O(1)-এ বোঝা যায়। Head বদলায় এমন কাজ (index 0) আলাদা করে সামলাও; বাকি insert/delete-এ index-এর **আগের** node (`curr`) পর্যন্ত `index - 1` ধাপ হাঁটো, তারপর pointer বদলাও।',
    steps: [
      '`Node(val)`: `this.val = val`, `this.next = null`। Constructor-এ `head = null`, `size = 0`।',
      '`get(index)`: `index < 0 || index >= size` হলে `-1`; না হলে `curr = head` থেকে `index` বার `curr = curr.next`, `curr.val` return।',
      '`addAtHead(val)`: `newNode.next = head`, তারপর `head = newNode`, `size++` (ক্রম জরুরি)।',
      '`addAtTail(val)`: list খালি হলে `head = newNode`; না হলে `while (curr.next !== null)` দিয়ে শেষ node-এ গিয়ে `curr.next = newNode`; `size++`।',
      '`addAtIndex(index, val)`: `index < 0 || index > size` হলে return। `index == 0` → `addAtHead`, `index == size` → `addAtTail` (দুটোই নিজে `size++` করে, তাই return)। নাহলে `curr`-কে `index - 1` ধাপ হাঁটাও, `newNode.next = curr.next`, `curr.next = newNode`, `size++`।',
      '`deleteAtIndex(index)`: `index < 0 || index >= size` হলে return। `index == 0` → `head = head.next`; নাহলে `curr`-কে `index - 1` ধাপ হাঁটাও, `curr.next = curr.next.next`। শেষে `size--`।',
    ],
    template: { lang: traverse.lang, code: traverse.code, whatChanges: traverse.whatChanges },
  },

  breakdown: {
    variables: [
      { name: 'head', role: 'প্রথম node (list-এর শুরু)', whenChanges: 'index 0-এ add / delete হলে' },
      {
        name: 'size',
        role: 'কয়টা node আছে; index valid কিনা বোঝার জন্য',
        whenChanges: 'প্রতিটা সফল add-এ ++, delete-এ --',
      },
      {
        name: 'curr',
        role: 'হাঁটার pointer; insert/delete-এ index-এর **আগের** node-এ থামে',
        whenChanges: 'loop-এ `curr = curr.next`',
      },
      { name: 'newNode', role: 'নতুন বসানো node', whenChanges: 'প্রতিটা add-এ নতুন' },
    ],
    invariant:
      '`size` সবসময় list-এর আসল node সংখ্যা, আর `head` থেকে `next` ধরে হাঁটলে ঠিক `size` টা node পেরিয়ে `null` আসে।',
    trace: [
      {
        kind: 'table',
        title: 'Trace (LeetCode example)',
        columns: ['operation', 'কী হলো', 'list (পরে)', 'size', 'return'],
        rows: [
          ['addAtHead(1)', 'head = newNode(1)', '1 → null', '1', '—'],
          ['addAtTail(3)', 'curr = 1, শেষ node; curr.next = 3', '1 → 3 → null', '2', '—'],
          [
            'addAtIndex(1, 2)',
            'index ≠ 0, ≠ size; curr = node 1 (0 ধাপ), 2.next = 3, 1.next = 2',
            '1 → 2 → 3 → null',
            '3',
            '—',
          ],
          ['get(1)', 'curr 1 ধাপ: node 2', '1 → 2 → 3 → null', '3', '2'],
          ['deleteAtIndex(1)', 'curr = node 1, 1.next = 1.next.next (3)', '1 → 3 → null', '2', '—'],
          ['get(1)', 'curr 1 ধাপ: node 3', '1 → 3 → null', '2', '3'],
        ],
        highlightCells: [
          [3, 4],
          [5, 4],
        ],
      },
      {
        kind: 'diagram',
        title: 'addAtIndex(1, 2): আগে নতুন node জোড়ো, তারপর পুরানো link ভাঙো',
        text: `head → [1] → [3] → null
        ↑ curr (index - 1 = 0)

newNode.next = curr.next:   [2] → [3]
curr.next = newNode:        [1] → [2]

ফলাফল: head → [1] → [2] → [3] → null`,
      },
    ],
    edgeCases: [
      'খালি list-এ `get(0)` → `-1` (size 0)',
      '`addAtIndex(size, val)` → শেষে যোগ; `addAtIndex(size + 1, val)` → কিছুই হয় না',
      '`deleteAtIndex(0)` → head বদলায়: `head = head.next`',
      'একটাই node থাকলে `deleteAtIndex(0)` → `head = null`',
      'Negative index → `get` দেয় `-1`, add/delete কিছু করে না',
    ],
    deepDiveBn: {
      heading: 'কেন index - 1-এ থামি, আর size কেন রাখি',
      body: 'Singly linked list-এ পিছনে যাওয়া যায় না। নতুন node বসাতে বা কাউকে মুছতে হলে **আগের** node-এর `.next` বদলাতে হয়, তাই `curr`-কে `index - 1` ধাপ হাঁটিয়ে আগের node-এ থামাই। Index 0-এর আগে কোনো node নেই, তাই head-এর case আলাদা। আর `size` রাখলে "index কি সীমার ভেতরে?" প্রশ্নের উত্তর হাঁটা ছাড়াই পাওয়া যায়; প্রতিটা add/delete-এ শুধু ঠিকমতো বাড়ানো-কমানো মনে রাখতে হয়।',
    },
  },

  solutions: [
    {
      label: 'My solution',
      isMine: true,
      lang: 'javascript',
      code: `function Node(val){
    this.val = val;
    this.next = null;
}

var MyLinkedList = function() {
    this.head = null;
    this.size = 0
};

/**
 * @param {number} index
 * @return {number}
 */
MyLinkedList.prototype.get = function(index) {
    if(index < 0 || index >= this.size) return -1;
    let curr = this.head;
    for(let i = 0; i < index; i++){
        curr = curr.next;
    }
    return curr.val;
};

/**
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtHead = function(val) {
    let newNode = new Node(val);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
};

/**
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtTail = function(val) {
    let newNode = new Node(val);
    if(this.head == null){
        this.head = newNode;
    } else{
        let curr = this.head;
        while(curr.next !== null){
            curr = curr.next;
        }
        curr.next = newNode;
    }
    this.size++;
};

/**
 * @param {number} index
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtIndex = function(index, val) {
    let newNode = new Node(val);
      if(index < 0 || index > this.size) return;
      if(index == 0) {
        this.addAtHead(val);
        return;
      }else if (index == this.size){
        this.addAtTail(val);
        return;
      }else{
        let curr = this.head;
        for(let i = 0; i < index - 1; i++){
            curr = curr.next;
        }

        newNode.next = curr.next;
        curr.next = newNode;

      }
      this.size++
};

/**
 * @param {number} index
 * @return {void}
 */
MyLinkedList.prototype.deleteAtIndex = function(index) {
     if(index < 0 || index >= this.size) return;
     if(index == 0){
        this.head = this.head.next;
     }else {
        let curr = this.head;
        for(let i = 0; i < index -1; i++){
            curr = curr.next;
        }

        curr.next = curr.next.next;
     }

     this.size--;
};

/**
 * Your MyLinkedList object will be instantiated and called as such:
 * var obj = new MyLinkedList()
 * var param_1 = obj.get(index)
 * obj.addAtHead(val)
 * obj.addAtTail(val)
 * obj.addAtIndex(index,val)
 * obj.deleteAtIndex(index)
 */`,
      lineByLine: [
        { line: 'this.size = 0', meaning: 'node গুনে রাখি, যাতে index check O(1)-এ হয়' },
        {
          line: 'if(index < 0 || index >= this.size) return -1;',
          meaning: '`get`-এ valid index: 0 থেকে size - 1',
        },
        {
          line: 'newNode.next = this.head; this.head = newNode;',
          meaning: 'আগে নতুন node পুরানো head-কে ধরে, তারপর head বদলায় (উল্টো ক্রমে list হারিয়ে যেত)',
        },
        {
          line: 'while(curr.next !== null)',
          meaning: 'শেষ node-এ থামো, কারণ তার `.next` বদলাতে হবে',
        },
        {
          line: 'if(index < 0 || index > this.size) return;',
          meaning: '`addAtIndex`-এ `index == size` চলে (শেষে যোগ), তাই এখানে `>`',
        },
        {
          line: 'this.addAtHead(val); return;',
          meaning: 'helper নিজেই `size++` করে, তাই return করে দ্বিগুণ বাড়ানো এড়াই',
        },
        {
          line: 'for(let i = 0; i < index - 1; i++)',
          meaning: 'index-এর **আগের** node পর্যন্ত হাঁটা',
        },
        {
          line: 'newNode.next = curr.next; curr.next = newNode;',
          meaning: 'আগে নতুন node পরেরটাকে ধরে, তারপর আগেরটা নতুন node-কে',
        },
        {
          line: 'curr.next = curr.next.next;',
          meaning: 'মুছতে হবে এমন node-কে bypass (কেউ point না করলে garbage collected)',
        },
        { line: 'this.size--;', meaning: 'সফল delete-এর পরে গোনা কমাও' },
      ],
      complexity: {
        time: 'get / addAtTail / addAtIndex / deleteAtIndex O(n), addAtHead O(1)',
        space: 'O(n) for the nodes, O(1) extra per operation',
      },
    },
    {
      label: 'Alternative: dummy head',
      isMine: false,
      lang: 'javascript',
      code: `function Node(val, next = null) {
    this.val = val;
    this.next = next;
}

var MyLinkedList = function () {
    this.dummy = new Node(0);   // fake node before the real head
    this.size = 0;
};

MyLinkedList.prototype.get = function (index) {
    if (index < 0 || index >= this.size) return -1;
    let curr = this.dummy.next;
    for (let i = 0; i < index; i++) curr = curr.next;
    return curr.val;
};

MyLinkedList.prototype.addAtIndex = function (index, val) {
    if (index < 0 || index > this.size) return;
    let prev = this.dummy;
    for (let i = 0; i < index; i++) prev = prev.next;   // node before index
    prev.next = new Node(val, prev.next);
    this.size++;
};

MyLinkedList.prototype.addAtHead = function (val) { this.addAtIndex(0, val); };
MyLinkedList.prototype.addAtTail = function (val) { this.addAtIndex(this.size, val); };

MyLinkedList.prototype.deleteAtIndex = function (index) {
    if (index < 0 || index >= this.size) return;
    let prev = this.dummy;
    for (let i = 0; i < index; i++) prev = prev.next;
    prev.next = prev.next.next;
    this.size--;
};`,
      complexity: {
        time: 'addAtHead O(1); others O(n)',
        space: 'O(n) for the nodes',
      },
      note: 'Dummy (sentinel) node থাকলে "আগের node" সবসময় থাকে, তাই index 0-এর আলাদা case লাগে না: একটাই `addAtIndex` দিয়ে head, tail, মাঝখান সব হয়। Notes-এর section 13.4-এর "Dummy node trick"।',
    },
  ],
  commonMistakes: [
    '`addAtIndex`-এ index 0 / size case-এ helper ডাকার পরে return না করা: `size` দুইবার বাড়ে',
    '`newNode.next = curr.next` এর আগে `curr.next = newNode` লেখা: বাকি list হারিয়ে যায়',
    '`index - 1` এর বদলে `index` ধাপ হাঁটা: এক ঘর পরে বসে যায়',
    '`addAtIndex`-এ `index > size` না দিয়ে `>= size` দেওয়া: শেষে যোগ (index == size) বাদ পড়ে',
    'Delete-এর পরে `size--` ভুলে যাওয়া: পরের `get` ভুল index-এ যায়',
  ],

  revise: {
    selfQuestions: [
      {
        q: 'Insert / delete-এ `curr` কোথায় থামে, আর কেন?',
        a: 'index-এর আগের node-এ (`index - 1` ধাপ), কারণ singly list-এ পিছনে যাওয়া যায় না, আগের node-এর `.next` বদলাতে হয়',
      },
      {
        q: '`get` আর `addAtIndex`-এর bound check-এ পার্থক্য কী?',
        a: '`get`: `index >= size` হলে invalid; `addAtIndex`: `index > size` হলে invalid (index == size মানে শেষে যোগ)',
      },
      {
        q: 'Head-এ insert করার দুই লাইনের ক্রম কী?',
        a: 'আগে `newNode.next = head`, তারপর `head = newNode`',
      },
    ],
    patternToRemember:
      'Keep a size, special-case index 0, otherwise walk to the node before the index and rewire its next.',
    related: [
      { number: 206, title: 'Reverse Linked List', note: 'pointer বদলানোর আরেকটা ক্লাসিক' },
      { number: 876, title: 'Middle of the Linked List' },
      { number: 146, title: 'LRU Cache', note: 'Doubly linked list + hash map' },
      { number: 19, title: 'Remove Nth Node From End of List', note: 'dummy node' },
    ],
  },

  visualizationId: 'lc-ll-design',
  acceptedOnLeetCode: true,
  meta: { generated: ['note', 'approach.idea', 'solutions.Alternative: dummy head'] },
};

export default problem;
