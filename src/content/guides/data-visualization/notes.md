# Data Visualization — Matplotlib, Seaborn ও Pandas

Stack: **Python 3.12 · Matplotlib 3.10+ · Seaborn 0.13 · Pandas 2.x** (ML অংশে scikit-learn)।
প্রতিটা code নিচের সেকশন ১-এর setup চালানোর পর notebook-এর মতো পরপর চালানো যায়। প্রতিটা গ্রাফের ছবি সেই code চালিয়েই বানানো।

> 💡 কীভাবে পড়বে: আগে সেকশন ২ (কোন চার্ট কখন) দেখো। তারপর যে চার্ট লাগবে তার সেকশনে গিয়ে code কপি করো। Interview-এর আগে সেকশন ২৭ (প্রশ্ন-উত্তর) আর সেকশন ২৮ (cheat sheet) একবার পড়ে নাও।

---

# পর্ব ১ — ভিত্তি

## 1. Setup, Figure ও Axes

```bash
pip install matplotlib seaborn pandas numpy scikit-learn
```

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Seaborn-এর built-in practice datasets (প্রথমবার internet লাগে, তারপর cache থাকে)
tips = sns.load_dataset('tips')          # রেস্টুরেন্টের bill: total_bill, tip, sex, smoker, day, time, size
penguins = sns.load_dataset('penguins').dropna()   # ৩ প্রজাতির penguin-এর মাপ
flights = sns.load_dataset('flights')    # 1949–1960 প্রতি মাসের যাত্রী সংখ্যা
titanic = sns.load_dataset('titanic')    # কে বেঁচেছিল (survived), class, age, fare...

print(tips.head())
print(tips.shape)
```

```
   total_bill   tip     sex smoker  day    time  size
0       16.99  1.01  Female     No  Sun  Dinner     2
1       10.34  1.66    Male     No  Sun  Dinner     3
2       21.01  3.50    Male     No  Sun  Dinner     3
3       23.68  3.31    Male     No  Sun  Dinner     2
4       24.59  3.61  Female     No  Sun  Dinner     4
(244, 7)
```

### Figure আর Axes: সবচেয়ে জরুরি ধারণা

- **Figure** = পুরো ক্যানভাস বা কাগজ। এক ফিগারে এক বা একাধিক গ্রাফ থাকতে পারে।
- **Axes** = কাগজের উপর একটা আসল গ্রাফ (x-axis, y-axis, title, legend সহ)। নামটা বিভ্রান্তিকর: **Axes ≠ axis**। Axes মানে পুরো একটা plot, আর axis মানে শুধু x বা y অক্ষটা।
- **Axis** = একটা অক্ষ (`ax.xaxis`): ticks, tick labels, limit।
- **Artist** = ফিগারে যা আঁকা হয় সবই artist: line, text, rectangle (bar), legend।

![Figure, Axes, axis, title, legend, ticks কোথায় থাকে তার লেবেল করা ছবি](/guides/data-visualization/anatomy.webp#732x459)

### দুই স্টাইলে লেখা যায়: pyplot বনাম Object-Oriented (OO)

```python
x = [1, 2, 3, 4, 5]
y = [3, 5, 4, 7, 9]

# ১) pyplot style: দ্রুত, একটা গ্রাফের জন্য
plt.plot(x, y)
plt.title('pyplot style')
plt.xlabel('x')
plt.show()

# ২) OO style: fig আর ax নিজের হাতে, একাধিক গ্রাফ বা বেশি control-এর জন্য
fig, ax = plt.subplots()
ax.plot(x, y)
ax.set_title('OO style')
ax.set_xlabel('x')
plt.show()
```

| pyplot (`plt.`) | OO (`ax.`) |
| --- | --- |
| `plt.title()` | `ax.set_title()` |
| `plt.xlabel()` / `plt.ylabel()` | `ax.set_xlabel()` / `ax.set_ylabel()` |
| `plt.xlim()` / `plt.ylim()` | `ax.set_xlim()` / `ax.set_ylim()` |
| `plt.xticks()` | `ax.set_xticks()` + `ax.set_xticklabels()` |
| `plt.legend()`, `plt.grid()` | `ax.legend()`, `ax.grid()` |

বাংলায়: pyplot style ভেতরে ভেতরে একটা "current Axes" মনে রাখে (`plt.gca()`), আর প্রতিটা `plt.` call সেটার উপরেই আঁকে। একটা গ্রাফ হলে এটা আরামদায়ক। কিন্তু ২×২ grid-এ কোন গ্রাফে আঁকছ সেটা পরিষ্কার রাখতে OO style-ই ভালো। প্রোডাকশন কোড, ফাংশন আর subplots-এ সবসময় OO লেখো।

> 💡 Interview line: "For quick exploration I use pyplot; for anything with multiple subplots or reusable functions I use the object-oriented API: `fig, ax = plt.subplots()` and call methods on `ax`."

### Notebook বনাম script

- Jupyter-এ সেলের শেষে গ্রাফ নিজেই দেখায়। Script (`python file.py`) চালালে `plt.show()` না দিলে কিছুই দেখাবে না।
- Server বা CI-তে (screen নেই) ছবি শুধু ফাইলে সেভ করতে চাইলে শুরুতেই `import matplotlib; matplotlib.use('Agg')` দাও।
- Loop-এ অনেক ফিগার বানালে প্রতিবার `plt.close(fig)` দাও, নাহলে memory বাড়তে থাকে (২০টার বেশি খোলা ফিগারে warning আসে)।

---

## 2. কোন চার্ট কখন (Chart chooser)

প্রথমে নিজেকে প্রশ্ন করো: **আমি কী দেখাতে চাই?** তারপর ডাটার টাইপ (numeric নাকি categorical) দেখে চার্ট বাছো।

| তুমি কী দেখাতে চাও | ডাটা | চার্ট | Matplotlib | Seaborn |
| --- | --- | --- | --- | --- |
| সময়ের সাথে পরিবর্তন (trend) | time × numeric | Line | `plt.plot` | `sns.lineplot` |
| দুই numeric-এর সম্পর্ক | numeric × numeric | Scatter | `plt.scatter` | `sns.scatterplot` |
| সম্পর্ক + trend line | numeric × numeric | Regression | — | `sns.regplot` / `lmplot` |
| একটা numeric কীভাবে ছড়ানো (distribution) | numeric | Histogram / KDE | `plt.hist` | `sns.histplot` / `kdeplot` |
| গ্রুপ ধরে তুলনা (mean/sum) | category × numeric | Bar | `plt.bar` | `sns.barplot` |
| কোন category-তে কয়টা row | category | Count | `value_counts().plot.bar()` | `sns.countplot` |
| গ্রুপের median, spread, outlier | category × numeric | Box / Violin | `plt.boxplot` | `sns.boxplot` / `violinplot` |
| পুরোটার কত অংশ (৫-৬টা ভাগ) | category × numeric | Pie / Donut | `plt.pie` | — |
| অনেক feature-এর correlation | numeric matrix | Heatmap | `plt.imshow` | `sns.heatmap` |
| সব feature জোড়ায় জোড়ায় | কয়েকটা numeric | Pair plot | — | `sns.pairplot` |
| subgroup ধরে আলাদা panel | যেকোনো + category | Facets | `plt.subplots` | `relplot` / `displot` / `catplot` |

### দ্রুত মনে রাখার নিয়ম

- **Trend → Line, Relationship → Scatter, Distribution → Histogram, Comparison → Bar, Composition → Stacked bar (বা অল্প ভাগ হলে Pie)।**
- Histogram-এ x হলো numeric range (bins), bar chart-এ x হলো category। Histogram-এর bar গুলো গায়ে গায়ে লাগানো থাকে, bar chart-এর গুলো ফাঁকা রেখে।
- Category অনেক বা নাম লম্বা হলে horizontal bar (`barh`) দাও।
- ৩টার বেশি variable দেখাতে রঙ (`hue`), সাইজ (`size`), marker (`style`) বা আলাদা panel (`col`/`row`) ব্যবহার করো।

---

# পর্ব ২ — Matplotlib

## 3. Line Plot — `plt.plot()`

কখন: সময় বা ক্রম অনুযায়ী মান কীভাবে বদলায়। স্টকের দাম, মাসিক বিক্রি, আর ML-এ **epoch vs loss** সবচেয়ে কমন ব্যবহার।

### 3.1 সাধারণ line plot

```python
year = [2015, 2016, 2017, 2018, 2019, 2020]
price = [48000, 54000, 57000, 49000, 47000, 45000]

plt.plot(year, price)
plt.title('Laptop price by year')
plt.xlabel('Year')
plt.ylabel('Price (BDT)')
plt.show()
```

![বছর অনুযায়ী দামের একটা সাধারণ line plot](/guides/data-visualization/line-basic.webp#590x453)

### 3.2 একাধিক লাইন + style + legend

```python
seasons = [2015, 2016, 2017, 2018, 2019, 2020, 2021]
kohli = [505, 973, 308, 530, 464, 466, 405]
rohit = [482, 489, 333, 286, 405, 332, 381]

plt.plot(seasons, kohli, color='tab:orange', linestyle='-', linewidth=2.5,
         marker='o', markersize=7, label='Kohli')
plt.plot(seasons, rohit, color='tab:blue', linestyle='--', linewidth=2,
         marker='s', label='Rohit')
plt.title('IPL runs per season')
plt.xlabel('Season')
plt.ylabel('Runs')
plt.legend(loc='upper right')
plt.grid(alpha=0.3)
plt.show()
```

![দুই ব্যাটসম্যানের সিজনভিত্তিক রানের দুটো লাইন, marker আর legend সহ](/guides/data-visualization/line-multi.webp#581x453)

Shortcut format string: `plt.plot(x, y, 'ro--')` = red (`r`), circle marker (`o`), dashed line (`--`)।

| parameter | কাজ | উদাহরণ |
| --- | --- | --- |
| `color` / `c` | রঙ | `'red'`, `'#1f77b4'`, `'tab:green'`, `'C0'` |
| `linestyle` / `ls` | লাইনের ধরন | `'-'`, `'--'`, `'-.'`, `':'` |
| `linewidth` / `lw` | মোটা | `2` |
| `marker` | বিন্দুর আকার | `'o'`, `'s'`, `'^'`, `'D'`, `'x'`, `'+'`, `'*'` |
| `markersize` / `ms` | marker সাইজ | `8` |
| `alpha` | স্বচ্ছতা (0–1) | `0.6` |
| `label` | legend-এ নাম | `'Kohli'` |

### 3.3 অক্ষের সীমা (xlim / ylim) আর log scale

```python
year = [2015, 2016, 2017, 2018, 2019, 2020, 2021]
price = [48000, 54000, 57000, 49000, 47000, 45000, 450000]   # শেষেরটা outlier

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3.5))
ax1.plot(year, price, marker='o')
ax1.set_title('Outlier squashes the rest')
ax2.plot(year, price, marker='o')
ax2.set_ylim(40000, 60000)        # শুধু এই অংশ দেখাও
ax2.set_title('ylim(40000, 60000)')
plt.show()
```

![বামে outlier-এর কারণে চ্যাপ্টা লাইন, ডানে ylim দিয়ে zoom করা](/guides/data-visualization/line-limits.webp#860x334)

বাংলায়: `xlim`/`ylim` ডাটা মুছে ফেলে না, শুধু কতটুকু দেখা যাবে ঠিক করে। কয়েকটা মান বাকিদের চেয়ে বহুগুণ বড় হলে `plt.yscale('log')` (বা `ax.set_yscale('log')`) দাও: তখন 10, 100, 1000 সমান দূরত্বে বসে, ছোট মানগুলোও চোখে পড়ে।

### 3.4 তারিখ (dates) x-axis-এ

Daily কাজে সবচেয়ে কমন: CSV-তে date কলাম থাকে। আগে `pd.to_datetime` করো, তারপর plot করলে Matplotlib নিজেই তারিখ বুঝে নেয়।

```python
import matplotlib.dates as mdates

flights['date'] = pd.to_datetime(flights['year'].astype(str) + '-' + flights['month'].astype(str), format='%Y-%b')

fig, ax = plt.subplots(figsize=(9, 3.5))
ax.plot(flights['date'], flights['passengers'])
ax.xaxis.set_major_locator(mdates.YearLocator(2))          # প্রতি ২ বছরে একটা tick
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y'))   # শুধু সাল দেখাও
ax.set_title('Monthly airline passengers')
fig.autofmt_xdate()                                        # লেবেল কাত করে overlap কমায়
plt.show()
```

![১৯৪৯–১৯৬০ মাসিক যাত্রী সংখ্যার time series, প্রতি দুই বছরে tick](/guides/data-visualization/line-dates.webp#754x319)

### 3.5 Area chart আর দুই y-axis (twinx)

```python
months = np.arange(1, 13)
revenue = np.array([20, 22, 25, 24, 28, 31, 35, 34, 30, 29, 33, 38])
orders = np.array([210, 230, 250, 240, 300, 320, 360, 350, 310, 300, 340, 400])

fig, ax = plt.subplots(figsize=(8, 3.5))
ax.fill_between(months, revenue, alpha=0.3)     # লাইনের নিচটা রঙ করা (area)
ax.plot(months, revenue, label='Revenue (lakh)')
ax.set_ylabel('Revenue (lakh)')

ax2 = ax.twinx()                                # একই x, ডানে আলাদা y-axis
ax2.plot(months, orders, color='tab:red', marker='o', label='Orders')
ax2.set_ylabel('Orders', color='tab:red')
ax.set_xlabel('Month')
plt.show()
```

![revenue-এর area chart আর ডান পাশের আলাদা y-axis-এ orders-এর লাইন](/guides/data-visualization/line-twinx.webp#744x333)

> ⚠️ দুই y-axis (twinx) সাবধানে ব্যবহার করো: দুই স্কেল ইচ্ছেমতো বদলে যেকোনো "সম্পর্ক" দেখানো যায়, তাই পাঠক ভুল বুঝতে পারে। সম্ভব হলে দুইটা আলাদা subplot দাও।

**ML-এ:** training vs validation loss curve (সেকশন ২৫.১), time series forecasting-এ actual vs predicted।

---

## 4. Scatter Plot — `plt.scatter()`

কখন: দুইটা numeric কলামের সম্পর্ক (correlation), cluster বা outlier দেখতে। তৃতীয় কলাম রঙ (`c`) বা সাইজ (`s`) দিয়ে দেখানো যায়।

### 4.1 সাধারণ scatter

```python
plt.scatter(tips['total_bill'], tips['tip'], color='tab:blue', marker='o', alpha=0.7)
plt.title('Bill vs tip')
plt.xlabel('Total bill ($)')
plt.ylabel('Tip ($)')
plt.show()
```

![total bill বনাম tip-এর scatter plot, bill বাড়লে tip বাড়ে](/guides/data-visualization/scatter-basic.webp#563x454)

### 4.2 রঙ (c + cmap), সাইজ (s), colorbar

```python
plt.figure(figsize=(8, 5))
sc = plt.scatter(penguins['flipper_length_mm'], penguins['body_mass_g'],
                 c=penguins['bill_length_mm'], cmap='viridis',
                 s=penguins['bill_depth_mm'] * 4, alpha=0.7, edgecolors='white')
plt.colorbar(sc, label='Bill length (mm)')
plt.xlabel('Flipper length (mm)')
plt.ylabel('Body mass (g)')
plt.show()
```

![penguin-এর flipper বনাম body mass, রঙ = bill length, পাশে colorbar](/guides/data-visualization/scatter-color.webp#679x448)

বাংলায়: `c=` এ একটা numeric কলাম দিলে প্রতিটা বিন্দুর রঙ সেই মান অনুযায়ী হয়, আর কোন মানে কোন রঙ সেটা `cmap` ঠিক করে। `s=` হলো বিন্দুর **ক্ষেত্রফল (area, points²)**, ব্যাসার্ধ না। তাই সাইজ দ্বিগুণ দেখাতে `s` চারগুণ করতে হয়। `alpha` দিলে overlap হওয়া জায়গা গাঢ় দেখায়।

### 4.3 Category অনুযায়ী রঙ (loop দিয়ে, legend সহ)

`c=` এ text কলাম (যেমন `'Adelie'`) দিলে error আসে। Matplotlib-এ category ধরে রঙ দিতে প্রতিটা গ্রুপ আলাদা করে আঁকো:

```python
for species, group in penguins.groupby('species'):
    plt.scatter(group['bill_length_mm'], group['bill_depth_mm'], label=species, alpha=0.7)
plt.xlabel('Bill length (mm)')
plt.ylabel('Bill depth (mm)')
plt.legend(title='Species')
plt.show()
```

![তিন প্রজাতির penguin তিন রঙে আলাদা cluster হয়ে আছে](/guides/data-visualization/scatter-groups.webp#563x433)

Seaborn-এ এই কাজটা এক লাইনে: `sns.scatterplot(data=penguins, x=..., y=..., hue='species')` (সেকশন ১৬)।

### 4.4 Reference line (axhline / axvline) আর নাম বসানো

```python
top = tips.nlargest(5, 'tip')
plt.scatter(tips['total_bill'], tips['tip'], alpha=0.4)
plt.axhline(tips['tip'].mean(), color='red', linestyle='--', label='mean tip')   # আনুভূমিক রেখা
plt.axvline(30, color='green', linestyle=':', label='bill = 30')                 # উল্লম্ব রেখা
for _, row in top.iterrows():
    plt.text(row['total_bill'] + 0.5, row['tip'], f"${row['tip']:.0f}", fontsize=9)
plt.legend()
plt.show()
```

![scatter-এর উপর গড় tip-এর লাল ড্যাশ লাইন, x=30-এ সবুজ লাইন, সবচেয়ে বড় ৫টা tip-এ লেবেল](/guides/data-visualization/scatter-lines.webp#549x413)

> 💡 হাজার হাজার পয়েন্ট হলে বিন্দু একটার উপর আরেকটা পড়ে (overplotting)। সমাধান: `alpha=0.2`, ছোট `s`, `plt.hexbin(x, y, gridsize=30)`, অথবা 2D histogram (সেকশন ১৭.৪)। শুধু পজিশন দরকার হলে `plt.plot(x, y, 'o')` scatter-এর চেয়ে দ্রুত।

**ML-এ:** feature বনাম target সম্পর্ক linear কি না, classification-এ class আলাদা হয় কি না, KMeans cluster আর PCA/t-SNE-এর ফল দেখাতে।

---

## 5. Bar Chart — `plt.bar()` / `plt.barh()`

কখন: category ধরে একটা সংখ্যা (sum, mean, count) তুলনা।

### 5.1 Vertical, horizontal আর bar-এর মাথায় value

```python
langs = ['Python', 'JavaScript', 'SQL', 'TypeScript', 'Go']
users = [68, 62, 51, 39, 14]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3.5))
bars = ax1.bar(langs, users, color='tab:blue')
ax1.bar_label(bars)                         # প্রতিটা bar-এর মাথায় সংখ্যা (matplotlib 3.4+)
ax1.tick_params(axis='x', rotation=30)      # লম্বা নাম কাত করা
ax1.set_title('bar')

order = np.argsort(users)                   # ছোট থেকে বড় সাজানো
ax2.barh(np.array(langs)[order], np.array(users)[order], color='tab:green')
ax2.set_title('barh (sorted)')
plt.tight_layout()
plt.show()
```

![বামে মাথায় সংখ্যাসহ vertical bar, ডানে সাজানো horizontal bar](/guides/data-visualization/bar-basic.webp#988x340)

### 5.2 Grouped (পাশাপাশি) bar

```python
players = ['Kohli', 'Rohit', 'Dhawan', 'Rahul']
r2019 = [464, 405, 521, 593]
r2020 = [466, 332, 618, 670]
r2021 = [405, 381, 587, 626]

x = np.arange(len(players))      # 0, 1, 2, 3
w = 0.25                         # প্রতিটা bar-এর চওড়া
plt.bar(x - w, r2019, width=w, label='2019')
plt.bar(x,     r2020, width=w, label='2020')
plt.bar(x + w, r2021, width=w, label='2021')
plt.xticks(x, players)           # 0,1,2,3-এর জায়গায় নাম
plt.ylabel('Runs')
plt.legend()
plt.show()
```

![চার খেলোয়াড়ের তিন সিজনের রান পাশাপাশি তিন রঙের bar-এ](/guides/data-visualization/bar-grouped.webp#572x417)

বাংলায়: প্রতিটা খেলোয়াড়ের জায়গা x = 0, 1, 2, 3। তিনটা সিজনের bar একই জায়গায় বসালে একটার উপর আরেকটা পড়বে। তাই একটাকে `-w`, একটাকে `0`, একটাকে `+w` সরিয়ে বসানো হয় (সরানোর পরিমাণ = width)। শেষে `plt.xticks(x, players)` দিয়ে সংখ্যার জায়গায় নাম বসাও।

### 5.3 Stacked bar

```python
r2019, r2020, r2021 = np.array(r2019), np.array(r2020), np.array(r2021)
plt.bar(players, r2019, label='2019')
plt.bar(players, r2020, bottom=r2019, label='2020')
plt.bar(players, r2021, bottom=r2019 + r2020, label='2021')
plt.ylabel('Total runs')
plt.legend()
plt.show()
```

![তিন সিজনের রান একটার উপর আরেকটা জমানো stacked bar](/guides/data-visualization/bar-stacked.webp#581x413)

বাংলায়: `bottom=` বলে bar কোথা থেকে শুরু হবে। প্রথমটা 0 থেকে, দ্বিতীয়টা প্রথমটার মাথা থেকে, তৃতীয়টা (প্রথম + দ্বিতীয়)-এর মাথা থেকে। তাই list-কে `np.array` বানাতে হয়: list-এ `+` করলে যোগ না হয়ে জোড়া লাগে।

> ⚠️ Bar chart-এর y-axis সবসময় **0 থেকে** শুরু করো। ৯০ থেকে শুরু করলে ৯২ আর ৯৮-এর পার্থক্য তিনগুণ মনে হয়: এটা সবচেয়ে কমন "misleading chart"। (Line chart-এ 0 থেকে শুরু বাধ্যতামূলক না।)

**ML-এ:** feature importance, বিভিন্ন model-এর accuracy তুলনা, class distribution (imbalance ধরতে)।

---

## 6. Histogram — `plt.hist()`

কখন: **একটা** numeric কলামের মানগুলো কোথায় বেশি জমে আছে (distribution): normal নাকি skewed, কয়টা peak, outlier আছে কি না।

### 6.1 bins

```python
fig, axes = plt.subplots(1, 3, figsize=(12, 3.2), sharey=False)
for ax, b in zip(axes, [5, 20, 60]):
    ax.hist(tips['total_bill'], bins=b, color='tab:purple', edgecolor='white')
    ax.set_title(f'bins={b}')
plt.tight_layout()
plt.show()
```

![একই ডাটার তিনটা histogram: bins=5 খুব মোটা, 20 ঠিকঠাক, 60 খুব খাঁজকাটা](/guides/data-visualization/hist-bins.webp#1190x310)

বাংলায়: `bins` = ডাটাকে কয়টা range-এ ভাগ করে গোনা হবে। একটা bar কত লম্বা = ওই range-এ কয়টা মান পড়েছে। কম bins দিলে detail হারায়, বেশি দিলে noise দেখায়। নির্দিষ্ট range চাইলে list দাও: `bins=[0, 10, 20, 30, 40, 50]`। `bins='auto'` দিলে numpy নিজে ভালো সংখ্যা বেছে নেয়।

### 6.2 density, একাধিক histogram, log scale

```python
lunch = tips.loc[tips['time'] == 'Lunch', 'total_bill']
dinner = tips.loc[tips['time'] == 'Dinner', 'total_bill']

plt.hist(lunch, bins=20, alpha=0.6, density=True, label='Lunch')
plt.hist(dinner, bins=20, alpha=0.6, density=True, label='Dinner')
plt.xlabel('Total bill ($)')
plt.ylabel('Density')
plt.legend()
plt.show()
```

![lunch আর dinner-এর bill-এর দুটো স্বচ্ছ histogram একসাথে, density স্কেলে](/guides/data-visualization/hist-overlap.webp#576x433)

- `density=True`: y-axis count না হয়ে density হয় (মোট ক্ষেত্রফল = 1)। দুই গ্রুপের সাইজ আলাদা হলে (এখানে dinner অনেক বেশি) তুলনা করতে এটা লাগে।
- `log=True`: y-axis log স্কেলে। কিছু bar বিশাল আর কিছু খুব ছোট হলে ছোটগুলোও দেখা যায়।
- `histtype='step'`: শুধু outline, অনেকগুলো একসাথে দেখাতে সুবিধা।

### 6.3 Skewness পড়া

```python
print(tips['total_bill'].skew().round(2))
print(tips['total_bill'].mean().round(2), tips['total_bill'].median())
```

```
1.13
19.79 17.795
```

বাংলায়: skew > 0 মানে ডানে লম্বা লেজ (right-skewed): বেশিরভাগ bill ছোট, কয়েকটা অনেক বড়। তখন **mean > median** হয়, কারণ বড় মানগুলো গড়কে টেনে তোলে। আয়, বাড়ির দাম, website visit সাধারণত right-skewed। ML-এ এমন feature-এ `np.log1p()` দিলে প্রায়ই distribution normal-এর কাছাকাছি হয়।

**ML-এ:** EDA-তে প্রতিটা feature-এর distribution, residual-এর distribution, predicted probability-র distribution।

---

## 7. Pie ও Donut — `plt.pie()`

কখন: অল্প কয়েকটা (৫-৬টার কম) ভাগ, যাদের যোগফল মিলে একটা "পুরো" হয়।

```python
share = tips['day'].value_counts()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
ax1.pie(share, labels=share.index, autopct='%1.1f%%', startangle=90,
        explode=[0.08, 0, 0, 0])            # প্রথম slice একটু বাইরে
ax1.set_title('Pie')

ax2.pie(share, labels=share.index, autopct='%1.0f%%', startangle=90,
        wedgeprops={'width': 0.4})          # মাঝখান ফাঁকা = donut
ax2.set_title('Donut')
plt.show()
```

![বামে explode করা pie chart, ডানে মাঝখান ফাঁকা donut, দুটোতেই শতকরা হার](/guides/data-visualization/pie.webp#759x349)

- `autopct='%1.1f%%'`: প্রতিটা slice-এ শতকরা হার, দশমিকের পর ১ ঘর (`%%` মানে `%` চিহ্ন)।
- `startangle=90`: প্রথম slice উপর থেকে শুরু। `explode`: কোন slice কতটা বাইরে টানবে।

> ⚠️ মানুষের চোখ কোণ (angle) তুলনায় দুর্বল: ২৩% আর ২৭%-এর পার্থক্য pie-তে বোঝা যায় না, bar-এ যায়। ভাগ অনেক হলে বা মান কাছাকাছি হলে **bar chart** দাও। Interview-এ "pie chart কখন ব্যবহার করবে না?" প্রায়ই জিজ্ঞেস করে।

---

## 8. Box Plot (Matplotlib) আর box plot পড়া

```python
groups = [tips.loc[tips['day'] == d, 'total_bill'] for d in ['Thur', 'Fri', 'Sat', 'Sun']]
plt.boxplot(groups, tick_labels=['Thur', 'Fri', 'Sat', 'Sun'])
plt.ylabel('Total bill ($)')
plt.show()
```

![চার দিনের bill-এর box plot, উপরে কিছু outlier বিন্দু](/guides/data-visualization/box-mpl.webp#563x413)

### Box plot কীভাবে পড়বে (interview favourite)

- **মাঝের লাইন** = median (Q2, 50th percentile)।
- **Box** = Q1 (25%) থেকে Q3 (75%), অর্থাৎ মাঝের ৫০% ডাটা। Box-এর উচ্চতা = **IQR = Q3 − Q1**।
- **Whisker** = box থেকে সবচেয়ে দূরের সেই ডাটা পর্যন্ত যা `Q1 − 1.5×IQR` থেকে `Q3 + 1.5×IQR`-এর ভেতরে।
- **বাইরের বিন্দু** = সম্ভাব্য outlier (1.5×IQR rule)।
- Median box-এর মাঝখানে না থাকলে বা একদিকের whisker লম্বা হলে ডাটা skewed।

```python
q1, q3 = tips['total_bill'].quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
outliers = tips[(tips['total_bill'] < low) | (tips['total_bill'] > high)]
print(f'Q1={q1:.2f}  Q3={q3:.2f}  IQR={iqr:.2f}')
print(f'outlier if > {high:.2f}:', len(outliers), 'rows')
```

```
Q1=13.35  Q3=24.13  IQR=10.78
outlier if > 40.30: 9 rows
```

---

## 9. Customization: title, ticks, legend, annotate, text

### 9.1 যা প্রায় সব গ্রাফে লাগে

```python
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(seasons, kohli, marker='o', label='Kohli')
ax.plot(seasons, rohit, marker='s', label='Rohit')

ax.set_title('IPL runs per season', fontsize=14, fontweight='bold', loc='left')
ax.set_xlabel('Season')
ax.set_ylabel('Runs')
ax.set_xticks(seasons)                                   # প্রতিটা সাল দেখাও
ax.set_ylim(0, 1150)
ax.legend(loc='upper left', frameon=False, ncols=2)
ax.grid(axis='y', alpha=0.3)
ax.spines[['top', 'right']].set_visible(False)           # উপরের আর ডানের বর্ডার সরাও

ax.annotate('Best season: 973', xy=(2016, 973), xytext=(2017.4, 1040),
            arrowprops=dict(arrowstyle='->', color='gray'))
for x, y in zip(seasons, kohli):
    ax.text(x, y + 25, y, ha='center', fontsize=8)       # প্রতিটা বিন্দুর উপর value
plt.show()
```

![title বাম দিকে, grid, তীরসহ annotate আর প্রতিটা বিন্দুর উপর value লেখা line plot](/guides/data-visualization/custom-full.webp#705x394)

| কাজ | কোড |
| --- | --- |
| বিন্দুতে লেখা | `ax.text(x, y, 'লেখা', ha='center', va='bottom', fontsize=9)` |
| তীরসহ লেখা | `ax.annotate('লেখা', xy=(x, y), xytext=(x2, y2), arrowprops=dict(arrowstyle='->'))` |
| Bar-এর মাথায় value | `ax.bar_label(bars, fmt='%.1f')` |
| Tick লেবেল ঘোরানো | `ax.tick_params(axis='x', rotation=45)` বা `plt.xticks(rotation=45)` |
| Tick-এ নিজের লেবেল | `ax.set_xticks([0, 1, 2], ['Low', 'Mid', 'High'])` |
| Legend ফিগারের বাইরে | `ax.legend(loc='upper left', bbox_to_anchor=(1, 1))` |
| Axis-এ % বা টাকা | `ax.yaxis.set_major_formatter(mticker.PercentFormatter())` (`import matplotlib.ticker as mticker`) |
| অক্ষ উল্টানো | `ax.invert_yaxis()` (barh-এ বড়টা উপরে আনতে) |
| পুরো ফিগারের title | `fig.suptitle('...')` |
| হাজারের কমা | `ax.yaxis.set_major_formatter(mticker.StrMethodFormatter('{x:,.0f}'))` |

### 9.2 `text()`-এর দরকারি parameter

| parameter | কাজ |
| --- | --- |
| `fontsize` | লেখার সাইজ |
| `color` | রঙ |
| `ha` / `va` | horizontal (`'left'`, `'center'`, `'right'`) / vertical (`'top'`, `'center'`, `'bottom'`) alignment |
| `rotation` | ডিগ্রিতে ঘোরানো |
| `fontweight` | `'bold'` |
| `bbox` | লেখার পেছনে বাক্স: `dict(facecolor='white', alpha=0.7)` |

> 💡 Legend খালি আসে? প্রতিটা `plot`/`scatter`/`bar`-এ `label=` দিতে ভুলে গেছ। Legend ডাটা ঢেকে দিলে `loc='best'` বা বাইরে নিয়ে যাও (`bbox_to_anchor`)।

---

## 10. Subplots ও Layout

### 10.1 `plt.subplots(nrows, ncols)`

```python
fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(9, 6), layout='constrained')
axes[0, 0].scatter(tips['total_bill'], tips['tip'], alpha=0.5)
axes[0, 0].set_title('Bill vs tip')
axes[0, 1].hist(tips['total_bill'], bins=20)
axes[0, 1].set_title('Bill distribution')
axes[1, 0].bar(share.index, share.values)
axes[1, 0].set_title('Rows per day')
axes[1, 1].boxplot(groups, tick_labels=['Thur', 'Fri', 'Sat', 'Sun'])
axes[1, 1].set_title('Bill by day')
fig.suptitle('Tips dashboard')
plt.show()
```

![২×২ grid-এ scatter, histogram, bar আর box plot একসাথে](/guides/data-visualization/subplots-grid.webp#911x611)

বাংলায়: `fig, axes = plt.subplots(...)` একসাথে Figure আর Axes দেয়।

- একটাই গ্রাফ হলে `ax` একটা object।
- এক সারি বা এক কলাম (`1, 3` বা `3, 1`) হলে 1D array: `axes[0]`, `axes[1]`।
- grid (`2, 2`) হলে 2D array: `axes[সারি, কলাম]`, যেমন `axes[1, 0]`।
- সব Axes-এ loop চালাতে: `for ax in axes.flat:`।

### 10.2 sharex / sharey, আর overlap ঠিক করা

```python
fig, axes = plt.subplots(2, 1, sharex=True, figsize=(7, 5))
axes[0].scatter(tips['total_bill'], tips['tip'], s=12)
axes[0].set_ylabel('Tip')
axes[1].scatter(tips['total_bill'], tips['size'], s=12, color='tab:orange')
axes[1].set_ylabel('Party size')
axes[1].set_xlabel('Total bill')
plt.tight_layout()
plt.show()
```

![একই x-axis ভাগ করা দুইটা উপর-নিচ scatter plot](/guides/data-visualization/subplots-sharex.webp#690x490)

- `sharex=True`: সব গ্রাফের x-axis একই স্কেলে, উপরের গুলোর tick label লুকানো। তুলনা সহজ হয়।
- লেবেল একটার উপর আরেকটা পড়ছে? `plt.tight_layout()` (প্লট শেষে) বা `plt.subplots(..., layout='constrained')` (শুরুতে)। Constrained layout colorbar আর suptitle-ও ভালো সামলায়।

### 10.3 অসমান layout: `subplot_mosaic`

```python
fig, axd = plt.subplot_mosaic([['main', 'main', 'side'],
                               ['main', 'main', 'side'],
                               ['bottom', 'bottom', 'bottom']],
                              figsize=(9, 6), layout='constrained')
axd['main'].scatter(tips['total_bill'], tips['tip'], alpha=0.5)
axd['main'].set_title('main')
axd['side'].hist(tips['tip'], bins=15, orientation='horizontal')
axd['side'].set_title('side')
axd['bottom'].plot(flights.groupby('year')['passengers'].sum())
axd['bottom'].set_title('bottom')
plt.show()
```

![বড় main plot, ডানে সরু side histogram, নিচে পুরো চওড়া line plot](/guides/data-visualization/subplots-mosaic.webp#911x611)

একই কাজ পুরনো উপায়ে: `fig.add_subplot(2, 2, 1)` (সারি, কলাম, নম্বর; নম্বর 1 থেকে শুরু) বা `GridSpec`। নতুন কোডে `subplot_mosaic` সবচেয়ে পড়তে সহজ।

---

## 11. Figure size, style, রঙ, colormap আর save

### 11.1 সাইজ আর style

```python
plt.figure(figsize=(10, 4))       # (চওড়া, উচ্চতা) ইঞ্চিতে; প্লটের আগে লিখতে হয়
print(plt.style.available[:6])
```

```
['Solarize_Light2', 'bmh', 'classic', 'dark_background', 'fast', 'fivethirtyeight']
```

```python
with plt.style.context('ggplot'):          # শুধু এই ব্লকের ভেতরে style
    plt.plot(seasons, kohli, marker='o')
    plt.title("style: 'ggplot'")
    plt.show()
```

![ggplot style-এ ধূসর background আর সাদা grid-সহ line plot](/guides/data-visualization/style-ggplot.webp#561x436)

- `plt.style.use('ggplot')` দিলে পরের **সব** গ্রাফে প্রযোজ্য হয়; ফেরাতে `plt.style.use('default')`। শুধু একটা গ্রাফে চাইলে `with plt.style.context(...)` সবচেয়ে নিরাপদ।
- সব গ্রাফের font size একবারে: `plt.rcParams['font.size'] = 12`, ফিগার সাইজ: `plt.rcParams['figure.figsize'] = (8, 4)`।

### 11.2 Colormap বাছাই

| ডাটার ধরন | Colormap | উদাহরণ |
| --- | --- | --- |
| **Sequential**: কম থেকে বেশি | এক রঙ হালকা → গাঢ় | `viridis`, `Blues`, `magma` |
| **Diverging**: মাঝখানে অর্থপূর্ণ মান (0) | দুই দিকে দুই রঙ | `coolwarm`, `RdBu`, `vlag` |
| **Qualitative**: category, কোনো ক্রম নেই | আলাদা আলাদা রঙ | `tab10`, `Set2`, `Pastel1` |

> 💡 `jet`/`rainbow` এড়িয়ে চলো: উজ্জ্বলতা সমানভাবে বাড়ে না, তাই ভুল "বর্ডার" দেখায় আর রঙ-অন্ধ মানুষ পড়তে পারে না। `viridis` perceptually uniform এবং colorblind-friendly; এজন্যই এটা default। Correlation-এর মতো −1 থেকে +1 ডাটায় diverging cmap দিয়ে `vmin=-1, vmax=1` (বা `center=0`) দাও।

### 11.3 Save করা

```python
fig, ax = plt.subplots()
ax.plot(seasons, kohli)
fig.savefig('runs.png', dpi=300, bbox_inches='tight')     # উচ্চ রেজোলিউশন, বাড়তি সাদা অংশ বাদ
fig.savefig('runs.svg')                                    # vector: যত zoom করো ঝাপসা হবে না
fig.savefig('runs.png', transparent=True)                  # স্বচ্ছ background
plt.close(fig)
```

- `savefig` সবসময় `plt.show()`-এর **আগে** দাও। Script-এ show() ফিগার বন্ধ করে দেয়, পরে save করলে খালি ছবি আসে।
- `dpi=300` print/report-এর জন্য, ওয়েবে 100–150 যথেষ্ট। Slide বা paper-এ লাইন চার্ট হলে `svg`/`pdf` (vector) সবচেয়ে ভালো।
- `bbox_inches='tight'` বাইরে রাখা legend বা লম্বা label কেটে যাওয়া আটকায়।

---

## 12. Heatmap (imshow) ও Contour

### 12.1 Matrix থেকে heatmap: `imshow`

```python
grid = flights.pivot(index='month', columns='year', values='passengers')
print(grid.iloc[:3, :4])

fig, ax = plt.subplots(figsize=(9, 5))
im = ax.imshow(grid, cmap='YlOrRd', aspect='auto')
ax.set_xticks(range(grid.shape[1]), grid.columns, rotation=45)
ax.set_yticks(range(grid.shape[0]), grid.index)
fig.colorbar(im, label='Passengers')
plt.show()
```

```
year   1949  1950  1951  1952
month                        
Jan     112   115   145   171
Feb     118   126   150   180
Mar     132   141   178   193
```

![মাস × বছরের যাত্রী সংখ্যার heatmap; জুলাই-আগস্ট আর পরের বছরগুলো সবচেয়ে গাঢ়](/guides/data-visualization/heatmap-imshow.webp#727x449)

বাংলায়: `pivot_table` লম্বা টেবিলকে (প্রতি row-এ year, month, passengers) একটা grid-এ সাজায়: সারি = month, কলাম = year। `imshow` প্রতিটা ঘরকে মান অনুযায়ী রঙ করে। ঘরের ভেতর সংখ্যা লিখতে `ax.text(j, i, value)`: **x = কলাম (j), y = সারি (i)**, উল্টো না। Seaborn-এর `sns.heatmap(grid, annot=True)` এটা এক লাইনে করে (সেকশন ২০)।

### 12.2 Contour আর meshgrid

```python
x = np.linspace(-3, 3, 200)
y = np.linspace(-3, 3, 200)
xx, yy = np.meshgrid(x, y)          # 200×200 grid-এর সব (x, y) জোড়া
z = np.sin(xx) + np.cos(yy)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4), layout='constrained')
cs = ax1.contour(xx, yy, z, levels=10, cmap='viridis')
ax1.clabel(cs, fontsize=7)          # রেখার উপর মান
ax1.set_title('contour (lines)')
cf = ax2.contourf(xx, yy, z, levels=20, cmap='viridis')
fig.colorbar(cf, ax=ax2)
ax2.set_title('contourf (filled)')
plt.show()
```

![বামে মানসহ contour রেখা, ডানে রঙে ভরাট contourf আর colorbar](/guides/data-visualization/contour.webp#1011x411)

বাংলায় meshgrid: surface বা contour আঁকতে প্রতিটা (x, y) জোড়ার জন্য একটা z লাগে। `x` আর `y` ২০০টা করে সংখ্যা, `np.meshgrid` এদের মিলিয়ে ২০০×২০০ = ৪০,০০০টা জোড়ার grid (`xx`, `yy`) বানায়। তারপর `z = f(xx, yy)` লিখলে সব z একবারে হিসাব হয় (vectorized)। Contour হলো মানচিত্রের উচ্চতার রেখার মতো: একই z মানের বিন্দুগুলো এক রেখায় জোড়া। `contourf`-এর f = filled।

**ML-এ:** loss landscape আর gradient descent-এর পথ, classifier-এর **decision boundary** (সেকশন ২৫.৪)।

---

## 13. 3D Plot

```python
fig = plt.figure(figsize=(11, 4.5))

ax1 = fig.add_subplot(1, 2, 1, projection='3d')
ax1.scatter(penguins['bill_length_mm'], penguins['flipper_length_mm'], penguins['body_mass_g'],
            c=penguins['species'].astype('category').cat.codes, cmap='viridis')
ax1.set_xlabel('Bill'); ax1.set_ylabel('Flipper'); ax1.set_zlabel('Mass')
ax1.set_title('3D scatter')

ax2 = fig.add_subplot(1, 2, 2, projection='3d')
surf = ax2.plot_surface(xx, yy, z, cmap='viridis')
fig.colorbar(surf, ax=ax2, shrink=0.6)
ax2.set_title('surface: sin(x) + cos(y)')
plt.show()
```

![বামে penguin-এর 3D scatter, ডানে sin(x)+cos(y)-এর 3D surface](/guides/data-visualization/plot-3d.webp#834x399)

- 3D-র জন্য Axes বানানোর সময় `projection='3d'` দিতে হয়, তারপর x, y, z তিনটা দাও।
- `ax.plot3D`, `ax.scatter3D` (বা শুধু `scatter`), `ax.plot_surface`, `ax.plot_wireframe`। ঘোরাতে `ax.view_init(elev=30, azim=45)`।
- 3D স্ক্রিনে পড়া কঠিন, দূরত্ব বোঝা যায় না। Report-এ সম্ভব হলে 2D + রঙ (scatter `c=`) বা contour দাও।

---

# পর্ব ৩ — Pandas দিয়ে plot

## 14. `df.plot()` — সবচেয়ে কম কোডে

Pandas-এর Series/DataFrame-এ `.plot()` ভেতরে Matplotlib চালায় এবং একটা Axes ফেরত দেয়, তাই পরে `ax.set_title()` ইত্যাদি লেখা যায়। EDA-তে দ্রুত দেখার জন্য সবচেয়ে সুবিধাজনক।

```python
fig, axes = plt.subplots(2, 2, figsize=(10, 7), layout='constrained')

flights.pivot_table(index='year', columns='month', values='passengers', observed=False)[['Jan', 'Jul']] \
    .plot(ax=axes[0, 0], title='line: Jan vs Jul by year')

tips.groupby('day', observed=True)['total_bill'].mean() \
    .plot(kind='bar', ax=axes[0, 1], rot=0, title='bar: mean bill by day')

pd.crosstab(tips['day'], tips['time']) \
    .plot(kind='bar', stacked=True, ax=axes[1, 0], rot=0, title='stacked bar: crosstab')

tips['tip'].plot(kind='hist', bins=20, ax=axes[1, 1], title='hist: tip')
plt.show()
```

![pandas plot দিয়ে চারটা গ্রাফ: line, groupby bar, crosstab stacked bar, histogram](/guides/data-visualization/pandas-plot.webp#1011x711)

| `kind=` | চার্ট | shortcut |
| --- | --- | --- |
| `'line'` (default) | line | `df.plot.line()` |
| `'bar'` / `'barh'` | bar | `df.plot.bar()` |
| `'hist'` | histogram | `df.plot.hist(bins=20)` |
| `'box'` | box plot | `df.plot.box()` |
| `'kde'` | density curve (scipy লাগে) | `df.plot.kde()` |
| `'area'` | area / stacked area | `df.plot.area()` |
| `'scatter'` | scatter (x, y লাগে) | `df.plot.scatter(x='a', y='b', c='c')` |
| `'hexbin'` | ঘন scatter | `df.plot.hexbin(x='a', y='b', gridsize=20)` |
| `'pie'` | pie (Series) | `s.plot.pie(autopct='%1.0f%%')` |

দরকারি parameter: `x=`, `y=`, `title=`, `figsize=`, `rot=` (tick ঘোরানো), `stacked=True`, `subplots=True` (প্রতিটা কলাম আলাদা গ্রাফে), `logy=True`, `ax=` (নিজের Axes-এ আঁকা)।

> 💡 DataFrame-এর **প্রতিটা কলাম একটা লাইন/bar হয়, আর index হয় x-axis**। তাই আগে `groupby`, `pivot_table` বা `crosstab` দিয়ে টেবিলটা "যেমন চার্ট চাই তেমন" আকারে সাজাও, তারপর `.plot()`। এটা বুঝলেই pandas plotting সহজ।

---

# পর্ব ৪ — Seaborn

## 15. Seaborn basics: `data`, `x`, `y`, `hue`

Seaborn হলো Matplotlib-এর উপর বানানো high-level library। DataFrame আর কলামের নাম দিলেই সুন্দর, statistic-সহ চার্ট দেয়: groupby, mean, confidence interval, legend সব নিজে করে।

```python
sns.set_theme(style='whitegrid')     # একবার দিলেই সব গ্রাফ seaborn look পায়

sns.scatterplot(data=tips, x='total_bill', y='tip', hue='time', style='smoker', size='size')
plt.title('One line, four variables')
plt.show()
```

![bill বনাম tip, রঙ = time, marker = smoker, সাইজ = party size](/guides/data-visualization/sns-basics.webp#566x458)

| parameter | কাজ |
| --- | --- |
| `data` | DataFrame |
| `x`, `y` | কলামের নাম |
| `hue` | category বা সংখ্যা অনুযায়ী **রঙ** |
| `style` | category অনুযায়ী marker / লাইনের ধরন |
| `size` | মান অনুযায়ী বিন্দুর সাইজ |
| `col`, `row` | আলাদা আলাদা panel (শুধু figure-level ফাংশনে) |
| `palette` | রঙের সেট: `'Set2'`, `'viridis'`, বা dict `{'Lunch': 'orange'}` |
| `order` / `hue_order` | category-র ক্রম |
| `ax` | নির্দিষ্ট Matplotlib Axes-এ আঁকা |

### Axes-level বনাম Figure-level (interview-এ আসে)

| | Axes-level | Figure-level |
| --- | --- | --- |
| উদাহরণ | `scatterplot`, `lineplot`, `histplot`, `kdeplot`, `boxplot`, `barplot`, `heatmap`, `regplot` | `relplot`, `displot`, `catplot`, `lmplot`, `pairplot`, `jointplot` |
| আঁকে কোথায় | একটা Matplotlib Axes-এ (`ax=` দেওয়া যায়) | নিজের নতুন Figure বানায় (FacetGrid) |
| ফেরত দেয় | `Axes` | `FacetGrid` / `PairGrid` / `JointGrid` |
| সাইজ | `plt.figure(figsize=...)` বা `plt.subplots` | `height=`, `aspect=` (figsize না) |
| বিশেষত্ব | নিজের subplot grid-এ বসানো যায় | `col=`, `row=` দিয়ে এক লাইনে অনেক panel |

প্রতিটা figure-level ফাংশন একটা "family"-র মালিক, `kind=` দিয়ে ভেতরের axes-level ফাংশন বাছে:

- `relplot(kind='scatter' | 'line')` → `scatterplot`, `lineplot`
- `displot(kind='hist' | 'kde' | 'ecdf')` → `histplot`, `kdeplot`, `ecdfplot`
- `catplot(kind='strip' | 'swarm' | 'box' | 'violin' | 'boxen' | 'point' | 'bar' | 'count')`

---

## 16. Relational plots: scatterplot, lineplot, relplot

### 16.1 scatterplot

```python
sns.scatterplot(data=penguins, x='flipper_length_mm', y='body_mass_g',
                hue='species', palette='Set2', alpha=0.8)
plt.show()
```

![তিন প্রজাতির penguin-এর flipper বনাম body mass, প্রজাতি অনুযায়ী তিন রঙ](/guides/data-visualization/sns-scatter.webp#582x438)

### 16.2 lineplot: একই x-এ অনেক মান থাকলে mean + confidence band

```python
sns.lineplot(data=flights, x='year', y='passengers', marker='o')
plt.title('Mean passengers per year (band = 95% CI)')
plt.show()
```

![বছর অনুযায়ী গড় যাত্রী সংখ্যার লাইন, চারপাশে হালকা confidence band](/guides/data-visualization/sns-line.webp#574x458)

বাংলায়: প্রতি বছরে ১২টা মাসের ১২টা মান আছে। `lineplot` নিজেই প্রতি x-এর **গড় (mean)** বের করে লাইন আঁকে, আর চারপাশের হালকা ছায়া হলো **95% confidence interval** (bootstrap দিয়ে হিসাব)। Band না চাইলে `errorbar=None`, standard deviation চাইলে `errorbar='sd'`। প্রতি মাসের আলাদা লাইন চাইলে `hue='month'`।

### 16.3 relplot: subgroup অনুযায়ী আলাদা panel

```python
sns.relplot(data=tips, x='total_bill', y='tip', hue='smoker',
            col='time', row='sex', height=3, aspect=1.2)
plt.show()
```

![lunch/dinner কলামে আর male/female সারিতে ভাগ করা চারটা scatter panel](/guides/data-visualization/sns-relplot.webp#786x584)

`col='time'` মানে time-এর প্রতিটা মানের জন্য আলাদা কলাম, `row='sex'` মানে sex-এর প্রতিটা মানের জন্য আলাদা সারি। সব panel একই স্কেলে, তাই তুলনা সহজ। কলাম অনেক হলে `col_wrap=3` দাও।

---

## 17. Distribution plots: histplot, kdeplot, ecdfplot, rugplot

### 17.1 histplot (+ KDE)

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), layout='constrained')
sns.histplot(data=tips, x='total_bill', bins=20, kde=True, ax=axes[0])
axes[0].set_title('histplot + kde=True')
sns.histplot(data=penguins, x='flipper_length_mm', hue='species',
             multiple='stack', ax=axes[1])
axes[1].set_title("hue + multiple='stack'")
plt.show()
```

![বামে KDE curve-সহ histogram, ডানে তিন প্রজাতির stacked histogram](/guides/data-visualization/sns-hist.webp#1111x411)

- `stat=`: `'count'` (default), `'probability'`, `'percent'`, `'density'`।
- `multiple=`: `'layer'` (একটার উপর আরেকটা, স্বচ্ছ), `'stack'`, `'dodge'` (পাশাপাশি), `'fill'` (প্রতি bin-এ ১০০%)।
- `element='step'`, `fill=False` দিলে শুধু outline: অনেক গ্রুপে পরিষ্কার।
- `log_scale=True`: x-axis log স্কেলে (skewed ডাটায়)।

### 17.2 kdeplot: smooth distribution

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), layout='constrained')
sns.kdeplot(data=penguins, x='body_mass_g', hue='species', fill=True,
            common_norm=False, alpha=0.4, ax=axes[0])
axes[0].set_title('kdeplot by species')
for bw in [0.3, 1, 2]:
    sns.kdeplot(data=tips, x='total_bill', bw_adjust=bw, label=f'bw_adjust={bw}', ax=axes[1])
axes[1].legend()
axes[1].set_title('bandwidth changes the shape')
plt.show()
```

![বামে তিন প্রজাতির ভরাট KDE curve, ডানে তিনটা আলাদা bandwidth-এ একই ডাটার curve](/guides/data-visualization/sns-kde.webp#1111x411)

বাংলায়: KDE (Kernel Density Estimation) প্রতিটা ডাটা পয়েন্টের উপর একটা ছোট bell curve বসিয়ে সব যোগ করে একটা মসৃণ curve বানায়। y-axis-এ **density**, count না; curve-এর নিচের মোট ক্ষেত্রফল = 1। `bw_adjust` ছোট দিলে curve খাঁজকাটা (overfit), বড় দিলে বেশি মসৃণ, peak হারিয়ে যায়। `common_norm=False` দিলে প্রতিটা গ্রুপের নিজের ক্ষেত্রফল 1 হয়, তাই ছোট গ্রুপও সমানভাবে দেখা যায়।

> ⚠️ KDE ডাটার সীমার বাইরেও curve টেনে দেয় (যেমন বয়স −5)। যেখানে মান কখনো ঋণাত্মক হয় না সেখানে `cut=0` বা `clip=(0, None)` দাও। আর KDE "আছে" দেখালেও আসলে ডাটা কম থাকতে পারে, তাই histogram বা rugplot-এর সাথে মিলিয়ে দেখো।

### 17.3 ecdfplot আর rugplot

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 3.8), layout='constrained')
sns.ecdfplot(data=tips, x='total_bill', hue='time', ax=axes[0])
axes[0].set_title('ECDF: share of bills ≤ x')
sns.kdeplot(data=tips, x='tip', ax=axes[1])
sns.rugplot(data=tips, x='tip', height=0.06, ax=axes[1])
axes[1].set_title('kde + rugplot')
plt.show()
```

![বামে lunch ও dinner-এর ECDF সিঁড়ির মতো curve, ডানে KDE-র নিচে প্রতিটা মানের ছোট দাগ](/guides/data-visualization/sns-ecdf-rug.webp#1111x391)

- **ECDF**: x পর্যন্ত মোট কত অংশ ডাটা (0 থেকে 1)। bins বা bandwidth বাছতে হয় না, তাই সবচেয়ে "সৎ" distribution plot। median পড়তে y = 0.5-এ দেখো।
- **rugplot**: প্রতিটা আসল মান x-axis-এ একটা ছোট দাগ। KDE বা histogram-এর সাথে বসায়।

### 17.4 দুই numeric-এর distribution: 2D histogram ও 2D KDE

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), layout='constrained')
sns.histplot(data=penguins, x='bill_length_mm', y='bill_depth_mm', bins=20, cbar=True, ax=axes[0])
axes[0].set_title('2D histplot')
sns.kdeplot(data=penguins, x='bill_length_mm', y='bill_depth_mm', hue='species', fill=True, alpha=0.5, ax=axes[1])
axes[1].set_title('2D kdeplot')
plt.show()
```

![বামে রঙিন ঘরের 2D histogram, ডানে তিন প্রজাতির ভরাট density contour](/guides/data-visualization/sns-2d.webp#1111x411)

ঘন scatter-এ (হাজার হাজার পয়েন্ট) কোথায় বেশি ডাটা জমেছে সেটা scatter-এ বোঝা যায় না; 2D histogram বা hexbin-এ পরিষ্কার দেখা যায়।

### 17.5 displot: figure-level, facet সহ

```python
sns.displot(data=penguins, x='flipper_length_mm', col='species', kde=True, height=3, aspect=1.1)
plt.show()
```

![তিন প্রজাতির flipper length-এর তিনটা আলাদা histogram panel](/guides/data-visualization/sns-displot.webp#974x284)

---

## 18. Categorical plots: count, bar, box, violin, strip, swarm, point

### 18.1 countplot বনাম barplot (সবচেয়ে বেশি গুলিয়ে যায়)

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), layout='constrained')
sns.countplot(data=titanic, x='class', hue='survived', ax=axes[0])
axes[0].set_title('countplot: how many rows')
sns.barplot(data=titanic, x='class', y='survived', hue='sex', ax=axes[1])
axes[1].set_title('barplot: mean of y (survival rate)')
plt.show()
```

![বামে class অনুযায়ী বাঁচা-মরার সংখ্যা, ডানে class ও sex অনুযায়ী বাঁচার হার error bar-সহ](/guides/data-visualization/sns-count-bar.webp#1111x411)

- **countplot**: শুধু x লাগে, প্রতিটা category-তে **কয়টা row** গোনে। Class imbalance দেখার প্রথম চার্ট।
- **barplot**: x আর y লাগে, প্রতিটা category-র **y-এর গড় (mean)** দেখায়, সাথে কালো error bar = 95% confidence interval। `survived` 0/1 হওয়ায় এর গড় = বাঁচার হার।
- অন্য statistic চাইলে `estimator='median'` বা `estimator='sum'`; error bar বদলাতে `errorbar='sd'` বা `errorbar=None`।
- আগে থেকে হিসাব করা মান (যেমন groupby-র ফল) হলে barplot-এ প্রতি category-তে একটাই row থাকে, তখন error bar আসে না।

```python
print(titanic.groupby('class', observed=True)['survived'].mean().round(3))
```

```
class
First     0.630
Second    0.473
Third     0.242
Name: survived, dtype: float64
```

উপরের ডান গ্রাফের bar-এর উচ্চতা ঠিক এই গড়গুলোই (sex অনুযায়ী ভাগ করে)।

### 18.2 boxplot আর violinplot

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), layout='constrained')
sns.boxplot(data=tips, x='day', y='total_bill', hue='smoker', ax=axes[0])
axes[0].set_title('boxplot')
sns.violinplot(data=tips, x='day', y='total_bill', hue='sex', split=True, inner='quart', ax=axes[1])
axes[1].set_title('violinplot (split, quartiles)')
plt.show()
```

![বামে দিন ও smoker অনুযায়ী box plot, ডানে দিন অনুযায়ী male/female split violin](/guides/data-visualization/sns-box-violin.webp#1111x411)

- **Box**: median, IQR, outlier (পড়ার নিয়ম সেকশন ৮-এ)। Outlier খুঁজতে আর অনেক গ্রুপ তুলনায় সেরা।
- **Violin**: box-এর তথ্য + দুই পাশে KDE-র আকার। চওড়া অংশে বেশি ডাটা। Box plot দুইটা peak (bimodal) লুকিয়ে ফেলে, violin দেখায়। `split=True` দুই hue-কে এক violin-এর দুই অর্ধেকে বসায়।
- `boxenplot`: বড় ডাটাসেটে box-এর উন্নত রূপ (বেশি quantile দেখায়)।

### 18.3 stripplot, swarmplot: প্রতিটা আসল বিন্দু

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), layout='constrained')
sns.boxplot(data=tips, x='day', y='tip', color='white', ax=axes[0])
sns.stripplot(data=tips, x='day', y='tip', alpha=0.5, jitter=0.25, ax=axes[0])
axes[0].set_title('box + stripplot')
sns.swarmplot(data=tips, x='day', y='tip', hue='sex', size=4, ax=axes[1])
axes[1].set_title('swarmplot')
plt.show()
```

![বামে box plot-এর উপর ছড়ানো বিন্দু, ডানে একটার সাথে আরেকটা না লেগে সাজানো swarm বিন্দু](/guides/data-visualization/sns-strip-swarm.webp#1111x411)

- **stripplot**: প্রতিটা row একটা বিন্দু; `jitter` বিন্দুগুলোকে একটু ডানে-বামে ছড়ায় যাতে overlap কমে।
- **swarmplot**: বিন্দু একটা আরেকটাকে এড়িয়ে বসে, distribution-এর আকারও দেখা যায়। কয়েকশো row পর্যন্ত ভালো; হাজার হাজার row-এ ধীর হয় আর বিন্দু জায়গা পায় না (warning আসে)।
- box/violin-এর উপর strip বসানো একটা ভালো pattern: summary + আসল ডাটা দুটোই দেখা যায়।

### 18.4 pointplot আর catplot

```python
sns.catplot(data=titanic, x='class', y='survived', hue='sex', col='embark_town',
            kind='point', height=3.2, aspect=0.9)
plt.show()
```

![তিন বন্দরের জন্য তিনটা panel-এ class অনুযায়ী male/female বাঁচার হার, বিন্দু আর লাইনে](/guides/data-visualization/sns-catplot.webp#949x304)

**pointplot** barplot-এর মতোই mean + CI দেখায়, কিন্তু bar-এর বদলে বিন্দু আর জোড়া লাইন। দুই গ্রুপের লাইন সমান্তরাল না হলে **interaction** আছে (যেমন class-এর প্রভাব male আর female-এ আলাদা)। `catplot` হলো সব categorical plot-এর figure-level রূপ: `kind=` আর `col=`/`row=`।

---

## 19. Regression plots: regplot, lmplot, residplot

```python
fig, axes = plt.subplots(1, 2, figsize=(11, 4), layout='constrained')
sns.regplot(data=tips, x='total_bill', y='tip', ax=axes[0],
            scatter_kws={'alpha': 0.5}, line_kws={'color': 'red'})
axes[0].set_title('regplot')
sns.residplot(data=tips, x='total_bill', y='tip', ax=axes[1], scatter_kws={'alpha': 0.5})
axes[1].axhline(0, color='gray', linestyle='--')
axes[1].set_title('residplot (actual − fitted)')
plt.show()
```

![বামে লাল fitted line আর confidence band-সহ scatter, ডানে শূন্যের চারপাশে residual বিন্দু](/guides/data-visualization/sns-reg.webp#1111x411)

- **regplot**: scatter + linear regression line + 95% CI band। Band হলো **লাইনটার** অনিশ্চয়তা, একটা নতুন বিন্দু কোথায় পড়বে তার range না। Curve fit চাইলে `order=2`, 0/1 target-এ `logistic=True`, outlier-প্রতিরোধী `robust=True`।
- **lmplot**: figure-level রূপ, `hue`/`col` দিয়ে প্রতিটা গ্রুপের আলাদা লাইন: `sns.lmplot(data=tips, x='total_bill', y='tip', hue='smoker')`।
- **residplot**: residual (actual − predicted) বনাম x। বিন্দু 0-এর চারপাশে **এলোমেলো** থাকলে linear model ঠিক আছে। U-আকৃতি = non-linear সম্পর্ক; ফানেল আকৃতি (ডানে ছড়ানো বাড়ছে) = heteroscedasticity। এখানে ডানে ছড়ানো একটু বাড়ছে।

```python
print(tips[['total_bill', 'tip']].corr().round(3))
```

```
            total_bill    tip
total_bill       1.000  0.676
tip              0.676  1.000
```

---

## 20. Matrix plots: heatmap ও clustermap

### 20.1 Correlation heatmap (EDA-র সবচেয়ে কমন চার্ট)

```python
corr = penguins.select_dtypes('number').corr()
mask = np.triu(np.ones_like(corr, dtype=bool))      # উপরের অর্ধেক লুকাও (একই তথ্য দুবার)

plt.figure(figsize=(6, 4.5))
sns.heatmap(corr, mask=mask, annot=True, fmt='.2f', cmap='coolwarm',
            vmin=-1, vmax=1, linewidths=0.5, square=True)
plt.title('Penguin feature correlation')
plt.show()
```

![penguin-এর চারটা numeric feature-এর correlation heatmap, নিচের ত্রিভুজে মানসহ](/guides/data-visualization/sns-heatmap-corr.webp#590x520)

- `annot=True` ঘরে সংখ্যা, `fmt='.2f'` দশমিকের পর ২ ঘর (count হলে `fmt='d'`)।
- Correlation −1 থেকে +1, তাই **diverging** cmap আর `vmin=-1, vmax=1` (বা `center=0`) দাও, যাতে 0 সবসময় নিরপেক্ষ রঙ হয়।
- `.corr()` default-এ **Pearson**: শুধু linear সম্পর্ক মাপে। Monotonic কিন্তু বাঁকা সম্পর্কে `method='spearman'`।
- flipper_length আর body_mass-এর 0.87: দুইটা feature প্রায় একই তথ্য দেয় (**multicollinearity**)। Linear model-এ একটা বাদ দেওয়ার কথা ভাবা যায়।

> ⚠️ Correlation ≠ causation। আইসক্রিম বিক্রি আর পানিতে ডোবা দুটোই গরমে বাড়ে: correlation বেশি, কিন্তু একটা আরেকটার কারণ না। আর correlation 0 মানে "কোনো সম্পর্ক নেই" না, শুধু linear সম্পর্ক নেই (যেমন U-আকৃতির সম্পর্কে Pearson ≈ 0)।

### 20.2 Pivot table heatmap

```python
grid = flights.pivot(index='month', columns='year', values='passengers')
plt.figure(figsize=(10, 5))
sns.heatmap(grid, annot=True, fmt='d', cmap='YlGnBu', annot_kws={'size': 7}, cbar_kws={'label': 'Passengers'})
plt.show()
```

![মাস × বছরের যাত্রী সংখ্যার heatmap, প্রতিটা ঘরে সংখ্যা লেখা](/guides/data-visualization/sns-heatmap-pivot.webp#805x453)

একই কাজ Matplotlib-এ (সেকশন ১২.১) ১০ লাইন লাগে: tick, colorbar, ঘরের সংখ্যা সব নিজে বসাতে হয়।

### 20.3 clustermap

```python
iris = sns.load_dataset('iris')
sample = iris.sample(40, random_state=0).set_index('species')
g = sns.clustermap(sample, standard_scale=1, cmap='mako', figsize=(6, 6), yticklabels=True)
g.ax_heatmap.tick_params(axis='y', labelsize=6)
plt.show()
```

![৪০টা iris ফুলের heatmap, পাশে আর উপরে hierarchical clustering-এর dendrogram](/guides/data-visualization/sns-clustermap.webp#560x595)

Heatmap + **hierarchical clustering**: একই রকম সারি আর কলামগুলো পাশাপাশি সাজায়, পাশে গাছের মতো dendrogram। `standard_scale=1` প্রতিটা কলামকে 0–1 স্কেলে আনে; না দিলে বড় range-এর কলাম (যেমন body_mass_g) পুরো রঙ দখল করে। একই প্রজাতির ফুল একসাথে জমে যায়।

---

## 21. Multi-plot grids: pairplot, jointplot, FacetGrid, PairGrid

### 21.1 pairplot

```python
sns.pairplot(penguins, vars=['bill_length_mm', 'bill_depth_mm', 'flipper_length_mm'],
             hue='species', height=2.2, corner=True)
plt.show()
```

![তিনটা feature-এর প্রতিটা জোড়ার scatter আর diagonal-এ প্রতিটার distribution, প্রজাতি অনুযায়ী রঙ](/guides/data-visualization/sns-pairplot.webp#774x650)

বাংলায়: প্রতিটা numeric feature-এর জোড়ার scatter একটা grid-এ, আর diagonal-এ প্রতিটা feature-এর নিজের distribution (hue দিলে KDE)। ML-এর আগে "কোন feature দিয়ে class আলাদা করা যায়" এক নজরে দেখার সবচেয়ে ভালো উপায়। `corner=True` উপরের ডুপ্লিকেট অর্ধেক বাদ দেয়। Feature ১০টার বেশি হলে ১০০টা panel: ধীর আর পড়া যায় না, তাই `vars=` দিয়ে বাছাই করো।

### 21.2 jointplot

```python
sns.jointplot(data=penguins, x='bill_length_mm', y='bill_depth_mm', hue='species', height=5)
plt.show()
```

![মাঝে প্রজাতি অনুযায়ী রঙিন scatter, উপরে আর ডানে প্রতিটা অক্ষের KDE](/guides/data-visualization/sns-jointplot.webp#480x484)

মাঝে দুই feature-এর সম্পর্ক, উপরে আর ডানে (margin) প্রতিটার আলাদা distribution। `kind='scatter' | 'kde' | 'hist' | 'hex' | 'reg' | 'resid'`। হাজার হাজার পয়েন্টে `kind='hex'` দাও।

এখানে একটা মজার জিনিস দেখো: সব penguin একসাথে ধরলে bill length বাড়লে depth সামান্য **কমে**, কিন্তু প্রতিটা প্রজাতির ভেতরে দুটোই একসাথে **বাড়ে**। এটাকে বলে **Simpson's paradox**: গ্রুপ (hue) না দেখলে উল্টো সিদ্ধান্ত হতে পারে।

### 21.3 FacetGrid: নিজের ফাংশন প্রতিটা panel-এ

```python
g = sns.FacetGrid(tips, col='time', row='smoker', height=2.6, aspect=1.3, margin_titles=True)
g.map_dataframe(sns.histplot, x='total_bill', bins=15)
g.set_axis_labels('Total bill ($)', 'Count')
g.set_titles(col_template='{col_name}', row_template='smoker: {row_name}')
plt.show()
```

![lunch/dinner আর smoker yes/no অনুযায়ী চারটা histogram panel](/guides/data-visualization/sns-facetgrid.webp#660x504)

### 21.4 PairGrid: উপরে-নিচে-মাঝে আলাদা চার্ট

```python
g = sns.PairGrid(penguins, vars=['bill_length_mm', 'flipper_length_mm', 'body_mass_g'],
                 hue='species', height=2.2)
g.map_upper(sns.scatterplot, s=12)
g.map_lower(sns.kdeplot)
g.map_diag(sns.histplot, element='step')
g.add_legend()
plt.show()
```

![উপরের ত্রিভুজে scatter, নিচে KDE contour, diagonal-এ step histogram](/guides/data-visualization/sns-pairgrid.webp#765x644)

`pairplot`/`jointplot`/`relplot` যথেষ্ট না হলে এই Grid class-গুলো দিয়ে প্রতিটা অংশে কী আঁকবে নিজে ঠিক করো।

---

## 22. Seaborn + Matplotlib একসাথে

Seaborn দিয়ে আঁকো, Matplotlib দিয়ে সাজাও: এটাই বাস্তবে সবচেয়ে কমন কাজের ধারা।

### 22.1 Axes-level: নিজের subplot-এ বসানো আর customize

```python
fig, ax = plt.subplots(figsize=(7, 4))
ax = sns.barplot(data=tips, x='day', y='total_bill', estimator='sum', errorbar=None,
                 color='tab:blue', ax=ax)
ax.bar_label(ax.containers[0], fmt='$%.0f')          # bar-এর মাথায় মোট
ax.set(title='Total sales by day', xlabel='', ylabel='Sales ($)')
sns.despine()                                        # উপরের আর ডানের বর্ডার সরাও
plt.show()
```

![দিন অনুযায়ী মোট বিক্রির bar chart, প্রতিটা bar-এর মাথায় ডলারে মোট](/guides/data-visualization/sns-mpl-axes.webp#629x375)

### 22.2 Figure-level: FacetGrid object দিয়ে

```python
g = sns.relplot(data=tips, x='total_bill', y='tip', col='time', hue='day', height=3.2)
g.set_axis_labels('Total bill ($)', 'Tip ($)')
g.set_titles('{col_name}')
g.figure.suptitle('Tips by meal', y=1.04)
for ax in g.axes.flat:
    ax.axline((0, 0), slope=0.15, color='gray', linestyle='--')   # 15% tip-এর রেখা
sns.move_legend(g, 'upper left', bbox_to_anchor=(1, 0.9))
plt.show()
```

![lunch আর dinner-এর দুটো scatter panel, দুটোতেই ১৫% tip-এর ড্যাশ রেখা](/guides/data-visualization/sns-mpl-figure.webp#811x335)

| কাজ | Axes-level (`ax`) | Figure-level (`g`) |
| --- | --- | --- |
| Title | `ax.set_title()` | `g.figure.suptitle()` / `g.set_titles()` |
| Label | `ax.set_xlabel()` বা `ax.set(xlabel=...)` | `g.set_axis_labels()` |
| Limit | `ax.set_xlim()` | `g.set(xlim=(0, 50))` |
| প্রতিটা panel | — | `for ax in g.axes.flat:` |
| Legend সরানো | `sns.move_legend(ax, ...)` | `sns.move_legend(g, ...)` |
| সাইজ | `plt.subplots(figsize=...)` | `height=`, `aspect=` |
| Save | `fig.savefig()` | `g.savefig()` বা `g.figure.savefig()` |

> ⚠️ Figure-level ফাংশনের আগে `plt.figure(figsize=...)` দিলে কাজ হয় না: সেটা একটা খালি ফিগার বানায়, আর relplot নিজের আরেকটা ফিগার বানায়। সাইজ দাও `height`/`aspect` দিয়ে। আর `ax=` প্যারামিটার figure-level ফাংশন নেয় না।

---

## 23. Theme, palette, context

```python
fig, axes = plt.subplots(1, 3, figsize=(12, 3.2), layout='constrained')
for ax, pal in zip(axes, ['deep', 'Set2', 'viridis']):
    sns.barplot(data=tips, x='day', y='tip', hue='day', palette=pal, errorbar=None, legend=False, ax=ax)
    ax.set_title(f"palette='{pal}'")
plt.show()
```

![একই bar chart তিনটা আলাদা palette-এ: deep, Set2, viridis](/guides/data-visualization/sns-palettes.webp#1211x331)

| ফাংশন | কাজ |
| --- | --- |
| `sns.set_theme(style='whitegrid', palette='deep', font_scale=1.1)` | একবারে সব ঠিক করা |
| `sns.set_style('white' \| 'dark' \| 'whitegrid' \| 'darkgrid' \| 'ticks')` | background আর grid |
| `sns.set_context('paper' \| 'notebook' \| 'talk' \| 'poster')` | লেখা আর লাইনের সাইজ (slide-এ `talk`) |
| `sns.color_palette('Set2', 5)` | রঙের list |
| `sns.color_palette('rocket', as_cmap=True)` | colormap হিসেবে |
| `with sns.axes_style('dark'):` | শুধু এই ব্লকে style |
| `sns.despine()` | উপরের আর ডানের বর্ডার সরাও |
| `sns.reset_defaults()` | Matplotlib-এর default-এ ফেরা |

> 💡 Seaborn 0.13: `palette` দিলে `hue`-ও দিতে হয়, নাহলে FutureWarning আসে। এক রঙ চাইলে শুধু `color='tab:blue'` দাও।

Palette বাছাইয়ের নিয়ম colormap-এর মতোই (সেকশন ১১.২): category-তে qualitative (`deep`, `Set2`, `tab10`), ক্রমবাচক মানে sequential (`rocket`, `mako`, `Blues`), মাঝখানে 0 থাকলে diverging (`vlag`, `coolwarm`)। রঙ-অন্ধদের জন্য `colorblind` palette আছে।

---

# পর্ব ৫ — Daily কাজ, ML ও Interview

## 24. EDA workflow: নতুন ডাটাসেট হাতে পেলে

ধাপে ধাপে, প্রতিটা ধাপের একটা চার্ট। Titanic দিয়ে উদাহরণ:

```python
print(titanic.shape)
print(titanic.isna().sum().sort_values(ascending=False).head(4))
print(titanic['survived'].value_counts(normalize=True).round(3))
```

```
(891, 15)
deck           688
age            177
embarked         2
embark_town      2
dtype: int64
survived
0    0.616
1    0.384
Name: proportion, dtype: float64
```

```python
fig, axes = plt.subplots(2, 3, figsize=(13, 7.5), layout='constrained')

# ১) Missing value কোথায়
missing = titanic.isna().mean().mul(100).sort_values(ascending=False).head(5)
sns.barplot(x=missing.values, y=missing.index, ax=axes[0, 0])
axes[0, 0].set(title='1. Missing values (%)', xlabel='% missing', ylabel='')

# ২) Target balance
sns.countplot(data=titanic, x='survived', ax=axes[0, 1])
axes[0, 1].set_title('2. Target balance')

# ৩) Numeric feature-এর distribution
sns.histplot(data=titanic, x='age', kde=True, ax=axes[0, 2])
axes[0, 2].set_title('3. Numeric distribution')

# ৪) Outlier
sns.boxplot(data=titanic, x='fare', ax=axes[1, 0])
axes[1, 0].set_title('4. Outliers (fare)')

# ৫) Feature বনাম target (categorical)
sns.barplot(data=titanic, x='sex', y='survived', hue='pclass', ax=axes[1, 1])
axes[1, 1].set_title('5. Survival rate by sex & class')

# ৬) Feature বনাম target (numeric)
sns.kdeplot(data=titanic, x='age', hue='survived', common_norm=False, fill=True, ax=axes[1, 2])
axes[1, 2].set_title('6. Age by survival')
plt.show()
```

![titanic-এর EDA dashboard: missing value, target balance, age distribution, fare outlier, sex ও class অনুযায়ী বাঁচার হার, বয়স অনুযায়ী বাঁচা](/guides/data-visualization/eda-dashboard.webp#1311x761)

### Checklist

1. **Shape, dtypes, missing**: `df.info()`, `df.isna().sum()`; missing বেশি হলে bar chart।
2. **Target**: regression হলে histogram (skewed? log দরকার?), classification হলে countplot (imbalance?)।
3. **Univariate**: প্রতিটা numeric-এ histogram/KDE, প্রতিটা categorical-এ countplot।
4. **Outlier**: boxplot (1.5×IQR)।
5. **Feature বনাম target**: numeric target হলে scatter/regplot; class target হলে boxplot/KDE `hue=target`, categorical feature হলে barplot (mean of target)।
6. **Feature বনাম feature**: correlation heatmap, pairplot (multicollinearity)।
7. **প্রতিটা চার্টের নিচে লেখো**: কী দেখলাম → সম্ভাব্য কারণ → পরের ধাপে কী যাচাই করব।

> ⚠️ Data leakage: scaling বা imputation-এর সিদ্ধান্ত পুরো ডাটা দেখে নিলে test set-এর তথ্য train-এ ঢুকে যায়। EDA করো, কিন্তু preprocessing শুধু **train set**-এ fit করো।

---

## 25. ML-এর জন্য দরকারি plot

### 25.1 Training vs validation loss (overfitting ধরা)

```python
epochs = np.arange(1, 31)
train_loss = 1.2 * np.exp(-epochs / 6) + 0.08
val_loss = 1.2 * np.exp(-epochs / 6) + 0.12 + 0.004 * np.maximum(0, epochs - 12) ** 1.4

best = epochs[np.argmin(val_loss)]
plt.plot(epochs, train_loss, label='train loss')
plt.plot(epochs, val_loss, label='validation loss')
plt.axvline(best, color='gray', linestyle='--', label=f'best epoch = {best}')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.show()
```

![train loss কমতেই থাকে, validation loss একটা epoch-এর পর আবার বাড়ে; সেখানে ড্যাশ রেখা](/guides/data-visualization/ml-loss.webp#570x438)

বাংলায়: train loss কমছে কিন্তু validation loss একসময় **বাড়তে শুরু করেছে** = overfitting: মডেল train ডাটা মুখস্থ করছে। দাগ দেওয়া epoch-এ থামানো = **early stopping**। দুটোই বেশি থাকলে = underfitting (মডেল খুব সরল)।

### 25.2 Confusion matrix আর ROC curve

```python
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import ConfusionMatrixDisplay, RocCurveDisplay, roc_auc_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)

fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), layout='constrained')
ConfusionMatrixDisplay.from_estimator(model, X_test, y_test, cmap='Blues', ax=axes[0], colorbar=False)
axes[0].grid(False)
RocCurveDisplay.from_estimator(model, X_test, y_test, ax=axes[1])
axes[1].plot([0, 1], [0, 1], 'k--', label='random guess')
axes[1].legend()
plt.show()
print('AUC:', round(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]), 3))
```

```
AUC: 0.998
```

![বামে 2×2 confusion matrix, ডানে কোণের দিকে উঠে যাওয়া ROC curve আর কর্ণ বরাবর random রেখা](/guides/data-visualization/ml-cm-roc.webp#1011x461)

- **Confusion matrix**: সারি = আসল class, কলাম = predicted। কর্ণের (diagonal) বাইরের ঘর = ভুল। কোন class-কে কোন class ভাবছে বোঝা যায়। Seaborn-এ নিজে আঁকতে: `sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d')`।
- **ROC curve**: প্রতিটা threshold-এ True Positive Rate বনাম False Positive Rate। Curve যত বাম-উপরের কোণে, মডেল তত ভালো। **AUC** = curve-এর নিচের ক্ষেত্রফল: 0.5 = এলোমেলো অনুমান, 1.0 = নিখুঁত।
- Imbalanced ডাটায় (যেমন ১% fraud) ROC আশাবাদী দেখায়; তখন **Precision-Recall curve** (`PrecisionRecallDisplay`) বেশি সৎ।

### 25.3 Feature importance

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer

data = load_breast_cancer(as_frame=True)
rf = RandomForestClassifier(n_estimators=200, random_state=0).fit(data.data, data.target)
imp = pd.Series(rf.feature_importances_, index=data.data.columns).nlargest(10).sort_values()

imp.plot(kind='barh', figsize=(7, 4.5), color='tab:green')
plt.title('Top 10 feature importances (Random Forest)')
plt.xlabel('Importance')
plt.show()
```

![random forest-এর সবচেয়ে গুরুত্বপূর্ণ ১০টা feature-এর horizontal bar, বড়টা উপরে](/guides/data-visualization/ml-importance.webp#716x435)

Horizontal bar কারণ feature-এর নাম লম্বা; `sort_values()` দিলে বড়টা উপরে আসে।

### 25.4 Decision boundary

```python
from sklearn.neighbors import KNeighborsClassifier

Xp = penguins[['bill_length_mm', 'bill_depth_mm']].values
yp = penguins['species'].astype('category').cat.codes.values
knn = KNeighborsClassifier(n_neighbors=15).fit(Xp, yp)

xx, yy = np.meshgrid(np.linspace(Xp[:, 0].min() - 1, Xp[:, 0].max() + 1, 300),
                     np.linspace(Xp[:, 1].min() - 1, Xp[:, 1].max() + 1, 300))
zz = knn.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

plt.contourf(xx, yy, zz, alpha=0.25, cmap='viridis')            # প্রতিটা এলাকায় predicted class
plt.scatter(Xp[:, 0], Xp[:, 1], c=yp, cmap='viridis', edgecolors='k', s=20)
plt.xlabel('Bill length (mm)')
plt.ylabel('Bill depth (mm)')
plt.title('KNN (k=15) decision regions')
plt.show()
```

![তিন রঙের এলাকায় ভাগ করা background (predicted class), উপরে আসল penguin বিন্দু](/guides/data-visualization/ml-boundary.webp#566x458)

বাংলায়: পুরো এলাকা জুড়ে একটা ঘন grid (meshgrid) বানাও, grid-এর প্রতিটা বিন্দুতে মডেলকে predict করাও, তারপর `contourf` দিয়ে প্রতিটা এলাকা তার predicted class-এর রঙে ভরাও। উপরে আসল ডাটা বসালে কোথায় মডেল ভুল করছে দেখা যায়। `np.c_[xx.ravel(), yy.ravel()]` grid-কে (n, 2) আকারের feature table বানায়।

### 25.5 আর যেগুলো জানা দরকার

| Plot | কেন | কীভাবে |
| --- | --- | --- |
| Predicted vs actual | Regression কতটা ঠিক | `plt.scatter(y_test, y_pred)` + `plt.axline((0, 0), slope=1)` |
| Residual plot | Pattern থাকলে মডেল কিছু মিস করছে | `sns.residplot` বা `plt.scatter(y_pred, y_test - y_pred)` |
| Learning curve | আরো ডাটা লাগবে কি না | `sklearn.model_selection.LearningCurveDisplay` |
| Elbow plot | KMeans-এ k কত | k বনাম `inertia_` line plot |
| PCA / t-SNE 2D | High-dimensional ডাটা দেখা | ২টা component-এর scatter, `hue=label` |
| Precision-Recall | Imbalanced classification | `PrecisionRecallDisplay.from_estimator` |
| Class distribution | Imbalance | `sns.countplot(x=y)` |

---

## 26. সাধারণ ভুল ও সমাধান

| সমস্যা | কারণ | সমাধান |
| --- | --- | --- |
| Script-এ গ্রাফ দেখায় না | `plt.show()` নেই | শেষে `plt.show()` দাও |
| সেভ করা ছবি খালি | `show()`-এর পরে `savefig()` | `savefig()` আগে দাও |
| সব লাইন একই গ্রাফে চলে আসে | একই current Axes | নতুন গ্রাফের আগে `plt.figure()`, বা OO style |
| `figsize` কাজ করে না | প্লটের পরে দেওয়া, বা figure-level seaborn | প্লটের আগে দাও; relplot/catplot-এ `height`/`aspect` |
| Legend খালি | `label=` দেওয়া হয়নি | প্রতিটা plot-এ `label=` |
| Label কেটে যায় / overlap | layout | `plt.tight_layout()`, `layout='constrained'`, `bbox_inches='tight'` |
| X-axis-এর লেবেল একটার উপর আরেকটা | অনেক বা লম্বা category | `rotation=45`, `barh`, বা `fig.autofmt_xdate()` (date) |
| `TypeError: 'Axes' object is not subscriptable` | একটা subplot-এ `ax[0]` | `plt.subplots(1, 1)` একটা ax দেয়; `squeeze=False` দিলে সবসময় 2D |
| `axes[0, 0]` এ IndexError | এক সারির grid 1D | `plt.subplots(1, 3)` → `axes[0]`; বা `axes.flat` |
| scatter-এ `c='species'` এ error | text কলাম | category codes, groupby loop, বা seaborn `hue` |
| Style পরের সব গ্রাফে চলে যায় | `plt.style.use` global | `with plt.style.context(...)`, বা `plt.style.use('default')` |
| Loop-এ memory বাড়ে / warning | ফিগার খোলা থাকে | `plt.close(fig)` |
| Server-এ `TclError` / display নেই | GUI backend | `matplotlib.use('Agg')` |
| Seaborn-এ `palette` দিলে FutureWarning | 0.13-এ hue ছাড়া palette | `hue=x, legend=False` দাও, বা `color=` |
| Category ভুল ক্রমে | alphabetical | `order=[...]` বা `pd.Categorical(..., ordered=True)` |
| Bar chart ভুল বার্তা দেয় | y-axis 0 থেকে শুরু না | Bar-এ সবসময় 0 থেকে |

---

## 27. Interview প্রশ্ন-উত্তর

### 27.1 Matplotlib-এ Figure আর Axes কী? `plt.plot` আর `ax.plot`-এর পার্থক্য?

**Answer:** A Figure is the whole canvas; an Axes is one plot inside it with its own x/y axis, title and legend, and a figure can hold many Axes. `plt.plot` is the pyplot state-machine interface: it draws on the "current" Axes. `ax.plot` is the object-oriented interface: you call methods on an explicit Axes. I use pyplot for quick checks and OO for subplots, functions and production code, because it is explicit about where each element goes.

### 27.2 Matplotlib, Seaborn, Plotly: কোনটা কখন?

**Answer:** Matplotlib is the low-level foundation: full control over every element, best for custom or publication figures. Seaborn sits on top of Matplotlib and works directly with DataFrames: statistical plots (distributions, CIs, regression, facets) in one line, with good defaults; ideal for EDA. Plotly (or Altair/Bokeh) makes interactive, browser-based charts with hover and zoom, good for dashboards and sharing. In practice: Seaborn to explore, Matplotlib to fine-tune, Plotly when someone needs to interact with it.

### 27.3 Histogram আর bar chart-এর পার্থক্য?

**Answer:** A histogram shows the distribution of one numeric variable: the x-axis is continuous, split into bins, and bars touch. A bar chart compares a value across categories: the x-axis is categorical, order can be changed, and bars are separated. Bin count changes how a histogram looks, so I check a few values or use a KDE/ECDF alongside.

### 27.4 Box plot কীভাবে পড়বে? Outlier কীভাবে ঠিক হয়?

**Answer:** The line is the median, the box spans Q1 to Q3 (the middle 50%, height = IQR), whiskers extend to the furthest points within 1.5×IQR of the box, and points beyond that are flagged as potential outliers. A median off-centre or one long whisker means skew. Box plots hide multimodality, so I use a violin plot or overlay a strip plot when shape matters.

### 27.5 Box plot বনাম violin plot?

**Answer:** Both compare a numeric variable across groups. A box plot shows five-number summary and outliers, compact and easy to read for many groups. A violin plot adds a mirrored KDE, so it shows the full shape, including two peaks a box plot would hide. Violins can mislead with very small samples because the KDE smooths over few points.

### 27.6 Correlation heatmap থেকে কী বোঝা যায়? সীমাবদ্ধতা কী?

**Answer:** It shows pairwise correlation coefficients between numeric features, from −1 to +1, so I can spot strong relationships with the target and multicollinearity between features. I use a diverging colormap centred at 0 and mask the duplicate triangle. Limits: Pearson only captures linear relationships (use Spearman for monotonic), it is sensitive to outliers, and correlation never proves causation.

### 27.7 অনেক পয়েন্টে scatter plot অপাঠ্য (overplotting) হলে কী করবে?

**Answer:** Lower `alpha` and marker size, sample the data, or switch to a density view: `hexbin`, a 2D histogram or a 2D KDE, which show where points concentrate. For many groups, facets (`col=`) split the cloud into readable panels.

### 27.8 Seaborn-এ axes-level আর figure-level ফাংশনের পার্থক্য?

**Answer:** Axes-level functions (`scatterplot`, `histplot`, `boxplot`, `heatmap`) draw onto one Matplotlib Axes, accept `ax=`, and return the Axes, so they fit into my own subplot layouts. Figure-level functions (`relplot`, `displot`, `catplot`, `lmplot`, `pairplot`, `jointplot`) create their own figure through a FacetGrid, support `col=`/`row=` faceting, are sized with `height` and `aspect`, and return a grid object.

### 27.9 Colormap কীভাবে বাছবে? `jet` কেন খারাপ?

**Answer:** Sequential (`viridis`, `Blues`) for ordered low-to-high values, diverging (`coolwarm`, `RdBu`) when there is a meaningful midpoint like 0, and qualitative (`tab10`, `Set2`) for unordered categories. `jet` is not perceptually uniform: brightness jumps create false boundaries, it prints badly in grayscale and is hard for colour-blind readers. `viridis` fixes all three, which is why it is Matplotlib's default.

### 27.10 Misleading chart-এর উদাহরণ দাও।

**Answer:** Truncated y-axis on a bar chart (small differences look huge), dual y-axes scaled to fake a correlation, pie charts with many similar slices, 3D effects that distort size, inconsistent scales across subplots, cherry-picked time windows, and area/bubble size scaled by radius instead of area. My rules: bars start at zero, shared scales when comparing, label units, and choose the simplest chart that answers the question.

### 27.11 Class imbalance কীভাবে দেখাবে, আর মডেল কেমন করছে কীভাবে দেখাবে?

**Answer:** A countplot of the target shows imbalance at a glance (with `value_counts(normalize=True)` for the numbers). For model results, a confusion matrix shows which classes get confused, and for imbalanced data a precision-recall curve is more honest than ROC, because ROC's false positive rate stays low when negatives dominate.

### 27.12 Overfitting চার্টে কীভাবে চেনো?

**Answer:** Plot training and validation loss (or accuracy) per epoch. If training loss keeps falling while validation loss flattens and starts rising, the model is overfitting; the minimum of the validation curve is where early stopping should stop. If both stay high, it is underfitting. A learning curve (score vs training size) tells me whether more data would help.

### 27.13 High-dimensional ডাটা কীভাবে visualize করবে?

**Answer:** For a handful of features, a pairplot or correlation heatmap. For many features, reduce to two dimensions with PCA (linear, preserves global variance, fast) or t-SNE/UMAP (non-linear, preserve local neighbourhoods, good for clusters), then scatter with `hue=label`. With t-SNE, distances between clusters and cluster sizes are not meaningful, only the grouping.

### 27.14 বড় রিপোর্টের জন্য ছবি কীভাবে সেভ করবে?

**Answer:** `fig.savefig('chart.png', dpi=300, bbox_inches='tight')` before `plt.show()`; vector formats (SVG, PDF) for slides and papers since they scale without blur; `transparent=True` for coloured backgrounds. In scripts or servers I use the `Agg` backend and `plt.close(fig)` after each save to avoid memory growth.

### 27.15 KDE-র bandwidth কী?

**Answer:** KDE places a small kernel (usually Gaussian) on each data point and sums them; the bandwidth is the kernel width. A small bandwidth follows noise and gives a spiky curve (undersmoothing), a large one hides real peaks (oversmoothing). In Seaborn I tune it with `bw_adjust`, and I check against a histogram or ECDF because KDE can also extend beyond the data's real range.

### 27.16 Seaborn barplot-এর কালো দাগ (error bar) কী?

**Answer:** By default Seaborn's barplot shows the mean of y per category, and the line is a 95% confidence interval for that mean, computed by bootstrapping. It can be changed with `errorbar='sd'` (standard deviation), `errorbar=('pi', 50)` or removed with `errorbar=None`, and the statistic with `estimator='median'` or `'sum'`.

---

## 28. Quick Reference (cheat sheet)

### Matplotlib: সব গ্রাফে কমন

| pyplot | OO | কাজ |
| --- | --- | --- |
| `plt.figure(figsize=(w, h))` | `fig, ax = plt.subplots(figsize=(w, h))` | ফিগার, সাইজ ইঞ্চিতে |
| `plt.title()` | `ax.set_title()` | শিরোনাম |
| `plt.xlabel()` / `ylabel()` | `ax.set_xlabel()` / `set_ylabel()` | অক্ষের নাম |
| `plt.xlim()` / `ylim()` | `ax.set_xlim()` / `set_ylim()` | সীমা |
| `plt.xscale('log')` | `ax.set_xscale('log')` | log স্কেল |
| `plt.xticks(pos, labels, rotation=45)` | `ax.set_xticks(pos, labels)` | tick |
| `plt.legend(loc='best')` | `ax.legend()` | legend (আগে `label=`) |
| `plt.grid(alpha=0.3)` | `ax.grid()` | grid |
| `plt.text(x, y, s)` | `ax.text()` | লেখা |
| `plt.annotate(s, xy, xytext, arrowprops)` | `ax.annotate()` | তীরসহ লেখা |
| `plt.axhline(y)` / `axvline(x)` | `ax.axhline()` | রেফারেন্স রেখা |
| `plt.tight_layout()` | `layout='constrained'` | overlap ঠিক |
| `plt.savefig('a.png', dpi=300, bbox_inches='tight')` | `fig.savefig()` | সেভ |
| `plt.show()` / `plt.close()` | `plt.close(fig)` | দেখানো / বন্ধ |

### Matplotlib: চার্ট আর তার parameter

| চার্ট | ফাংশন | দরকারি parameter |
| --- | --- | --- |
| Line | `plot(x, y)` | `color`, `ls`, `lw`, `marker`, `ms`, `label`, `alpha` |
| Area | `fill_between(x, y)` / `stackplot` | `alpha`, `color` |
| Scatter | `scatter(x, y)` | `s` (area), `c`, `cmap`, `alpha`, `marker`, `edgecolors` |
| Bar | `bar(x, h)` / `barh(y, w)` | `width`/`height`, `bottom`/`left`, `color`, `label` |
| Histogram | `hist(x)` | `bins`, `density`, `log`, `range`, `histtype`, `alpha` |
| Pie | `pie(x)` | `labels`, `autopct`, `explode`, `startangle`, `wedgeprops` |
| Box | `boxplot(data)` | `tick_labels`, `vert`, `showfliers` |
| Heatmap | `imshow(M)` | `cmap`, `aspect`, `vmin`, `vmax` |
| Contour | `contour` / `contourf(X, Y, Z)` | `levels`, `cmap` |
| Dense scatter | `hexbin(x, y)` | `gridsize`, `cmap` |
| Error bars | `errorbar(x, y, yerr=)` | `fmt`, `capsize` |
| 3D | `add_subplot(projection='3d')` | `scatter`, `plot_surface`, `view_init` |

### Seaborn: এক নজরে

| প্রশ্ন | ফাংশন | figure-level |
| --- | --- | --- |
| দুই numeric-এর সম্পর্ক | `scatterplot` | `relplot(kind='scatter')` |
| Trend / time | `lineplot` | `relplot(kind='line')` |
| Distribution | `histplot`, `kdeplot`, `ecdfplot`, `rugplot` | `displot` |
| Category-তে কয়টা | `countplot` | `catplot(kind='count')` |
| Category-র mean | `barplot`, `pointplot` | `catplot(kind='bar' / 'point')` |
| Category-র spread | `boxplot`, `violinplot`, `boxenplot` | `catplot(kind='box' / 'violin')` |
| প্রতিটা বিন্দু | `stripplot`, `swarmplot` | `catplot(kind='strip' / 'swarm')` |
| Linear fit | `regplot`, `residplot` | `lmplot` |
| Matrix | `heatmap`, `clustermap` | — |
| সব জোড়া | — | `pairplot`, `PairGrid` |
| দুই feature + margin | — | `jointplot`, `JointGrid` |

### Linestyle, marker, legend loc

| Linestyle | Marker | Legend `loc` |
| --- | --- | --- |
| `'-'` solid | `'o'` গোল, `'s'` বর্গ | `'best'` (default) |
| `'--'` dashed | `'^'` ত্রিভুজ, `'D'` হীরা | `'upper right'`, `'upper left'` |
| `'-.'` dashdot | `'x'`, `'+'` | `'lower right'`, `'lower left'` |
| `':'` dotted | `'*'` তারা, `'.'` ছোট বিন্দু | `'center'`, বাইরে: `bbox_to_anchor=(1, 1)` |
