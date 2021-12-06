import pandas as pd, matplotlib.pyplot as plt, seaborn as sns

df = pd.read_csv('dataset.csv')

# Pie chart for region column
sns.set_style('whitegrid')
df.groupby('STORE_R').size().plot(kind='pie', autopct='%1.1f%%', figsize=(8, 8), colors=sns.color_palette('pastel')[0:4])
plt.title('Store Region Distribution')
plt.savefig('store_region_distribution.png', bbox_inches='tight')

# Bar plot of counts per HH_SIZE
sns.set_style('whitegrid')
plt.bar(['3', '5+', '2', '4'], df['HH_SIZE'].value_counts().values)
plt.xlabel('Household Size')
plt.ylabel('Number of Households')
plt.title('Household Size Distribution')
plt.savefig('household_size_distribution.png', bbox_inches='tight')

# Total spending per WEEK_NUM
df['WEEK_NUM'] = df['WEEK_NUM'].astype(int)
df['WEEK_SPEND'] = df['SPEND'] * df['WEEK_NUM']

# Box plot of spending over time
sns.set_style('whitegrid')
plt.figure(figsize=(16, 10))
sns.boxplot(df['WEEK_NUM'], df['WEEK_SPEND'])
plt.xlabel('Week Number')
plt.ylabel('Spending')
plt.title('Spending by Week Number')
plt.savefig('spending_by_week_number.png', bbox_inches='tight')

# Number of transactions over time
df['WEEK_NUM'].value_counts(normalize=True).sort_index().plot(kind='line', figsize=(10,5))
# Red line at "expected" percentage
plt.axhline(y=0.021, color='r', linestyle='-')
plt.xlabel('Week Number')
plt.ylabel('Percentage of Transactions')
plt.savefig('total_transactions_by_week.png', bbox_inches='tight')

# Time series for each age group
sns.set_style('whitegrid')
plt.figure(figsize=(16, 10))
sns.lineplot(df['PURCHASE_'], df['SPEND'], hue=df['AGE_RANGE'], palette='pastel')
plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
plt.xlabel('Date')
plt.ylabel('Spending')
plt.title('Spending by Date and Age Range')
plt.savefig('spending_by_date_and_age.png', bbox_inches='tight')

# The following frames contain ~90% of transactions
df_produce = df[df['COMMODITY'].str.contains('PRODUCE')]
df_grocery = df[df['COMMODITY'].str.contains('GROCERY STAPLE')]
df_dairy = df[df['COMMODITY'].str.contains('DAIRY')]
df_frozen = df[df['COMMODITY'].str.contains('FROZEN FOOD')]
df_bakery = df[df['COMMODITY'].str.contains('BAKERY')]

# Line plot of the selected commodity values showing central tendency
sns.set_style('whitegrid')
plt.figure(figsize=(25, 10))
sns.lineplot(x='WEEK_NUM', y='SPEND', data=df_produce, color='#1f77b4', label='Produce')
sns.lineplot(x='WEEK_NUM', y='SPEND', data=df_grocery, color='#ff7f0e', label='Grocery')
sns.lineplot(x='WEEK_NUM', y='SPEND', data=df_dairy, color='#2ca02c', label='Dairy')
sns.lineplot(x='WEEK_NUM', y='SPEND', data=df_frozen, color='#d62728', label='Frozen')
sns.lineplot(x='WEEK_NUM', y='SPEND', data=df_bakery, color='#9467bd', label='Bakery')
plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
plt.xlabel('Week Number')
plt.ylabel('Spending')
plt.title('Categorical Spending by Week Number')
plt.savefig('spending_by_week_number_categorical.png', bbox_inches='tight')