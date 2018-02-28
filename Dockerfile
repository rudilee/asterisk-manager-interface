FROM centos:7
ADD tucny-asterisk.repo /etc/yum.repos.d/asterisk.repo
RUN rpm --import https://ast.tucny.com/repo/RPM-GPG-KEY-dtucny && yum install -y epel-release && rpm -iv https://centos7.iuscommunity.org/ius-release.rpm && yum install -y asterisk asterisk-pjsip
ADD manager.conf /etc/asterisk/
EXPOSE 5038
ENTRYPOINT ["/usr/sbin/asterisk", "-cvvvv"]