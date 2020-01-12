//
//
//  blogify.c:     a utility for making blogposts out of txt files.
//
//  Created by Daniel Rehman on 2001127.
//  Copyright © 2020 Daniel Rehman. All rights reserved.
//

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>
#include <errno.h>
#include <unistd.h>
#include <sys/time.h>

const char* template_0 =
"<!DOCTYPE html>\n"
"<html>\n"
"    <title>";const char* template_1 = "</title>\n"
"    <head>\n"
"        <style>\n"
"             h1 {\n"
"                 font-family: monospace;\n"
"             }\n"
"             \n"
"             p {\n"
"                 white-space: pre-wrap;\n"
"                 font-family: monospace;\n"
"                 font-size: 20px;\n"
"                 margin: 30px;\n"
"             }\n"
"        </style>\n"
"    </head>\n"
"    <body>\n"
"        <h1>"; const char* template_2 = "</h1>\n\n"
"        <p>"; const char* template_3 = "</p>\n"
"    </body>\n";

const char* index_template = "\n            <li><b><a href=\"%s.html\">%s</a></b></li>\n";
const char* blog_index_location = "/Users/deniylreimn/Documents/projects/website/blog/index.html";
const char* blog_location =       "/Users/deniylreimn/Documents/projects/website/blog/";


void open_file(const char* filename, char** text, unsigned long* length) {
    FILE* file = fopen(filename, "r");
    if (!file) { perror("fopen(r)"); exit(1); }
    fseek(file, 0L, SEEK_END);
    *length = ftell(file) + 1;
    *text = (char*) calloc(*length, sizeof(char));
    fseek(file, 0L, SEEK_SET);
    fread(*text, sizeof(char), *length - 1, file);
    if (ferror(file)) { perror("read"); exit(1); }
    fclose(file);
}

static inline void get_datetime(char buffer[16]) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    struct tm* tm_info = localtime(&tv.tv_sec);
    strftime(buffer, 15, "%y%m%d%u.%H%M%S", tm_info);
}

int main(int argc, const char * argv[]) {
    if (argc < 2) { printf("usage: \n\t./blogify <txt_file>\n\na utility program to take a txt file, and turn it into a blog post, named the current datetime.\n\n"); exit(1); }
    
    char* text = NULL; unsigned long length = 0;
    printf("opening file \"%s\" for reading...\n", argv[1]);
    open_file(argv[1], &text, &length);
    printf("read %lu characters from file \"%s\".\n", length, argv[1]);
        
    char postname[16] = {0}, output_filepath[4096] = {0};
    get_datetime(postname);
    strcpy(output_filepath, blog_location);
    strcat(output_filepath, postname);
    strcat(output_filepath, ".html");
    
    printf("opening destintation file \"%s\"...\n", output_filepath);
    FILE* out = fopen(output_filepath, "w+");
    if (!out) { perror("fopen(w+)"); exit(1); }
    
    printf("writing blogpost to \"%s\"...\n", output_filepath);
    fwrite(template_0, sizeof(char), strlen(template_0), out);
    fwrite(postname, sizeof(char), 16, out);
    fwrite(template_1, sizeof(char), strlen(template_1), out);
    fwrite(postname, sizeof(char), 16, out);
    fwrite(template_2, sizeof(char), strlen(template_2), out);
    fwrite(text, sizeof(char), length, out);
    fwrite(template_3, sizeof(char), strlen(template_3), out);
    fclose(out);
    free(text);
    printf("wrote blogpost!\n");
            
    char* index = NULL; length = 0;
    printf("opening blog.html index file at \"%s\"...\n", blog_index_location);
    open_file(blog_index_location, &index, &length);
    printf("read %lu characters from file \"%s\".\n", length, blog_index_location);
    
    char toinsert[1000] = {0};
    sprintf(toinsert, index_template, postname, postname);
    printf("constructed index: \"%s\".\n", toinsert);
        
    printf("rewriting index \"%s\"...\n", blog_index_location);
    FILE* new = fopen(blog_index_location, "w");
    if (!new) { perror("fopen(w)"); exit(1); }
    
    char c = 0, p = 0; unsigned long i = 0;
    while ((c = index[i++])) {
        if (c == '\n' && p == '\n') fputs(toinsert, new);
        else fputc(c, new);
        p = c;
    }
    printf("blog post indexed.\n");
    fclose(new);
    free(index);
    printf("     done!\n");
    return 0;
}
