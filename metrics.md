
Number of commits:
```
git rev-list --count --all
```

Number of features:
```
git rev-list --count --merges --since=2020-02-01 master
```

Number of files:
```
git ls-files | wc -l
```

Lines of code:
```
git ls-files | egrep -v "ttf|png|lock.json" | xargs wc -l | sort -n
```

Number of automated tests:
```
git ls-files | egrep "spec.ts" | xargs egrep "^\s*it\(" | wc -l
```

