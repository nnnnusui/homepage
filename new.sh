pwd=$(cd $(dirname $0); pwd)
time=`date "+%s"`
file=${pwd}/src/${time}.m5
touch $file
code $file
